package com.kspk.controller;

import com.kspk.DTOs.OrderRequest;
import com.kspk.DTOs.OrderResponse;
import com.kspk.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrderWithPayment(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderWithPayment(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> verificationData) {
        String paymentIntentId = verificationData.get("stripePaymentIntentId");
        String status = verificationData.getOrDefault("status", "UNKNOWN");

        orderService.varifyPayment(verificationData, status);
        return ResponseEntity.ok("✅ Payment verified successfully for PI: " + paymentIntentId);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrder() {
        return ResponseEntity.ok(orderService.getUserOrders());
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> removeOrder(@PathVariable String orderId) {
        orderService.removeOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderResponse>> getOrdersOfAllUsers() {
        return ResponseEntity.ok(orderService.getOrdersOfAllUsers());
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable String orderId, @RequestBody String status) {
        return ResponseEntity.ok(orderService.updateOrder(orderId, status));
    }
}
