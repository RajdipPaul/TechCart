package com.TechCart.cart;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TechCart.cart.dto.AddToCartRequest;
import com.TechCart.cart.dto.CartResponse;
import com.TechCart.cart.dto.UpdateCartItemRequest;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // View the logged-in user's cart
    @GetMapping
    public CartResponse getCart(Authentication authentication) {
        return cartService.getCart(authentication);
    }

    // Add a product to the cart
    @PostMapping("/items")
    public CartResponse addItem(
            @RequestBody AddToCartRequest request,
            Authentication authentication) {
        return cartService.addItem(request, authentication);
    }

    // Update cart item quantity
    @PutMapping("/items/{cItemsId}")
    public CartResponse updateItem(
            @PathVariable Long cItemsId,
            @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {
        return cartService.updateItem(cItemsId, request, authentication);
    }

    // Remove a particular item
    @DeleteMapping("/items/{cItemsId}")
    public CartResponse removeItem(
            @PathVariable Long cItemsId,
            Authentication authentication) {
        return cartService.removeItem(cItemsId, authentication);
    }

    // Clear the entire cart
    @DeleteMapping("/items")
    public CartResponse clearCart(Authentication authentication) {
        return cartService.clearCart(authentication);
    }
}