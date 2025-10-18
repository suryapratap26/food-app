package com.kspk.DTOs;

import lombok.Builder;
import lombok.Data;

import java.util.List;


@Data
@Builder
public class OrderResponse {
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;
    private double amount;
    private String paymentStatus;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String orderStatus;
    private List<OrderItems> OrderedItems;

}