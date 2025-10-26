package com.kspk.service;

import com.kspk.DTOs.OrderRequest;
import com.kspk.DTOs.OrderResponse;

import java.util.List;
import java.util.Map;

public interface OrderService {
    OrderResponse createOrderWithPayment(OrderRequest request);
   void varifyPayment(Map<String,String> paymentData,String status);
   List<OrderResponse> getUserOrders();
   void removeOrder(String orderId);
   List<OrderResponse> getOrdersOfAllUsers();
   OrderResponse updateOrder(String orderId,String status);
}
