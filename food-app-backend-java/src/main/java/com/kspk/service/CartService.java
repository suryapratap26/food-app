package com.kspk.service;

import com.kspk.DTOs.CartRequest;
import com.kspk.DTOs.CartResponse;

import java.util.List;

public interface CartService {
   CartResponse addToCart(CartRequest cartRequest);
   CartResponse getCart();
   void clearCart();
   CartResponse removeFromCart(CartRequest cartRequest);
}
