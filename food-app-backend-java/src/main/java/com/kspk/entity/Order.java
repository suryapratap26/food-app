package com.kspk.entity;

import com.kspk.DTOs.OrderItems;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document
@Data
@Builder
public class Order {
    @Id
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;
    private List<OrderItems> orderItemsList;
    private double amount;
    private String paymentStatus;
    private String stripePaymentIntentId;
    private String stripeClientSecret;;
    private String orderStatus;

}
