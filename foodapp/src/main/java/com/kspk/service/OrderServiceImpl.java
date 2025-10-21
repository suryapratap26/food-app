package com.kspk.service;

import com.kspk.DTOs.OrderRequest;
import com.kspk.DTOs.OrderResponse;
import com.kspk.entity.Order;
import com.kspk.repository.CartRepository;
import com.kspk.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    @Value("${stripe.secret.key}")
    private String STRIPE_SECRET_KEY;

    @Override
    @Transactional
    public OrderResponse createOrderWithPayment(OrderRequest request) {
        Order order = converToEntity(request);
        String loggedInUserId = userService.findByUserId();
        order.setUserId(loggedInUserId);

        order = orderRepository.save(order);

        Stripe.apiKey = STRIPE_SECRET_KEY;

        try {
            long amountInSmallestUnit = (long) (order.getAmount() * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSmallestUnit)
                    .setCurrency("inr")
                    .putMetadata("order_id", order.getId())
                    .putMetadata("user_id", loggedInUserId)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            order.setStripePaymentIntentId(paymentIntent.getId());
            order.setStripeClientSecret(paymentIntent.getClientSecret());
            order.setPaymentStatus("PENDING");
            order.setOrderStatus("AWAITING_PAYMENT");

        } catch (StripeException e) {
            System.err.println("Stripe Error creating Payment Intent for Order " + order.getId() + ": " + e.getMessage());
            throw new RuntimeException("Failed to initiate payment with Stripe.", e);
        }

        order = orderRepository.save(order);
        return convertToResponse(order);
    }

    @Override
    @Transactional
    public void varifyPayment(Map<String, String> paymentData, String status) {
        String paymentIntentId = paymentData.get("stripePaymentIntentId");

        if (paymentIntentId == null || paymentIntentId.isEmpty()) {
            System.err.println("Verification failed: Missing stripePaymentIntentId in paymentData.");
            throw new IllegalArgumentException("Missing Payment Intent ID for verification.");
        }

        Order order = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Order not found for Payment Intent ID: " + paymentIntentId));

        System.out.println("Verifying payment for intent " + paymentIntentId + " with status: " + status);

        if ("succeeded".equalsIgnoreCase(status)
                || "success".equalsIgnoreCase(status)
                || "paid".equalsIgnoreCase(status)) {

            order.setPaymentStatus("SUCCESS");
            order.setOrderStatus("PROCESSING");

            String userId = userService.findByUserId();
            cartRepository.deleteByUserId(userId);

            System.out.println("✅ Order " + order.getId() + " marked as SUCCESS and cart cleared.");
        } else if ("failed".equalsIgnoreCase(status) || "denied".equalsIgnoreCase(status)) {
            order.setPaymentStatus("FAILED");
            order.setOrderStatus("PAYMENT_FAILED");
            System.out.println("❌ Payment failed for Order " + order.getId());
        } else {
            order.setPaymentStatus(status.toUpperCase());
            System.out.println("ℹ️ Payment for Order " + order.getId() + " has unhandled status: " + status);
        }

        orderRepository.save(order);
    }

    @Override
    public List<OrderResponse> getUserOrders() {
        List<Order> list = orderRepository.findByUserId(userService.findByUserId());
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
        List<Order> list = orderRepository.findAll();
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // Inside OrderServiceImpl.java

    @Override
    public OrderResponse updateOrder(String orderId, String status) {
        // 💡 Improvement: Validate the incoming status string
        List<String> validStatuses = List.of("PLACED", "PROCESSING", "PREPARING", "DELIVERED", "CANCELLED");
        String upperStatus = status.toUpperCase();

        if (!validStatuses.contains(upperStatus)) {
            throw new IllegalArgumentException("Invalid order status provided: " + status);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order does not exist"));

        if (order.getOrderStatus().equals(upperStatus)) {
            return convertToResponse(order);
        }

        order.setOrderStatus(upperStatus);
        orderRepository.save(order);
        return convertToResponse(order);
    }

    private Order converToEntity(OrderRequest orderRequest) {
        return Order.builder()
                .userAddress(orderRequest.getUserAddress())
                .amount(orderRequest.getAmount())
                .orderItemsList(orderRequest.getOrderItems())
                .paymentStatus("PENDING_INTENT_CREATION")
                .orderStatus("INITIATED")
                .phoneNumber(orderRequest.getPhoneNumber())
                .email(orderRequest.getEmail())
                .build();
    }

    private OrderResponse convertToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .userAddress(order.getUserAddress())
                .phoneNumber(order.getPhoneNumber())
                .email(order.getEmail())
                .amount(order.getAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .OrderedItems(order.getOrderItemsList())
                .stripePaymentIntentId(order.getStripePaymentIntentId())
                .stripeClientSecret(order.getStripeClientSecret())
                .build();
    }
}
