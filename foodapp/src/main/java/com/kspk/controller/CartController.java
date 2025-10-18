package com.kspk.controller;

import com.kspk.DTOs.CartRequest;
import com.kspk.entity.Cart;
import com.kspk.service.CartService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@AllArgsConstructor
public class CartController {

    @Autowired
    private final CartService cartService;


    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartRequest request){
        String foodId=request.getFoodId();
        if(foodId==null || foodId.isEmpty()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Food id is required");
        }

        return ResponseEntity.ok().body(cartService.addToCart(request));
    }

    @GetMapping
    public ResponseEntity<?> getCart(){
        return ResponseEntity.ok().body(cartService.getCart());
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(){
        cartService.clearCart();
       return ResponseEntity.ok().build();
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeCart(@RequestBody CartRequest request){
        String foodId=request.getFoodId();
        if(foodId==null || foodId.isEmpty()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Food id is required");
        }

        return ResponseEntity.ok().body(cartService.removeFromCart(request));
    }
}
