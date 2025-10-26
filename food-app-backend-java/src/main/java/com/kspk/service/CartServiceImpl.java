package com.kspk.service;

import com.kspk.DTOs.CartRequest;
import com.kspk.DTOs.CartResponse;
import com.kspk.entity.Cart;
import com.kspk.repository.CartRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartServiceImpl implements CartService{
    private final UserService userService;
    private final CartRepository cartRepository;
    @Override
    public CartResponse addToCart(CartRequest cartRequest) {
        String loggedInUserId= userService.findByUserId();
        Optional<Cart> optionalCart= cartRepository.findByUserId(loggedInUserId);
        Cart cart=optionalCart.orElseGet(()-> new Cart(loggedInUserId,new HashMap<>()));
        Map<String,Integer> cartItems=cart.getItems();
        cart.setUserId(loggedInUserId);
        cartItems.put(cartRequest.getFoodId(),cartItems.getOrDefault(cartRequest.getFoodId(),0)+1);
        cart.setItems(cartItems);
      return  convertToResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse getCart() {
        String loggedInUserId= userService.findByUserId();
        Cart cart= cartRepository.findByUserId(loggedInUserId).orElse(new Cart(null , loggedInUserId,new HashMap<>()));
        return convertToResponse(cart);
    }

    @Override
    public void clearCart() {
        String loggedInUserId= userService.findByUserId();
        cartRepository.deleteByUserId(loggedInUserId);
    }

    @Override
    public CartResponse removeFromCart(CartRequest cartRequest) {
        String loggedInUserId= userService.findByUserId();
        Cart cart=cartRepository.findByUserId(loggedInUserId)
                .orElseThrow(()->new RuntimeException("Cart not found"));
        Map<String,Integer> cartItems=cart.getItems();

        if(cartItems.containsKey(cartRequest.getFoodId())){
            int currentQty= cartItems.get(cartRequest.getFoodId());
        if (currentQty>0){
            cartItems.put(cartRequest.getFoodId(),currentQty-1);
        }else {
            cartItems.remove(cartRequest.getFoodId());
        }

      return convertToResponse(cartRepository.save(cart));
        }

        return null;
    }


    private CartResponse  convertToResponse(Cart cart){
        return new CartResponse(cart.getId(), cart.getUserId(), cart.getItems());
    }
}
