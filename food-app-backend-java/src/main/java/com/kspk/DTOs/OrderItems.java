package com.kspk.DTOs;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItems {
    private String foodId;
    private int quantity;
    private double price;
    private String category;
    private String imageUrl;
    private String description;
    private String name;
}
