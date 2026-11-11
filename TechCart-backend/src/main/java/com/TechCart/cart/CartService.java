
package com.TechCart.cart;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TechCart.cart.dto.AddToCartRequest;
import com.TechCart.cart.dto.CartItemResponse;
import com.TechCart.cart.dto.CartResponse;
import com.TechCart.cart.dto.UpdateCartItemRequest;
import com.TechCart.product.Product;
import com.TechCart.product.ProductRepository;
import com.TechCart.user.User;
import com.TechCart.user.UserRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Value("${paypal.inr-per-usd}")
    private BigDecimal inrPerUsd;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // View cart
    @Transactional
    public CartResponse getCart(Authentication authentication) {

        Cart cart = getOrCreateCart(getAuthenticatedUser(authentication));

        return convertToResponse(cart);
    }

    // Add product to cart
    @Transactional
    public CartResponse addItem(
            AddToCartRequest request,
            Authentication authentication) {

        if (request.getPId() == null) {
            throw new IllegalArgumentException("Product ID is required");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        User user = getAuthenticatedUser(authentication);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository
                .findByPIdAndIsActiveTrue(request.getPId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found or inactive"));

        if (product.getStockQuantity() == null ||
                product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        CartItem item = cartItemRepository
                .findByCartCartIdAndProductPId(cart.getCartId(), product.getPId())
                .orElse(null);

        int newQuantity = request.getQuantity();

        if (item != null) {
            newQuantity += item.getQuantity();
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
        }

        if (newQuantity > product.getStockQuantity()) {
            throw new IllegalArgumentException(
                    "Requested quantity exceeds available stock");
        }

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        cartRepository.save(cart);

        return convertToResponse(cart);
    }

    // Update quantity of a cart item
    @Transactional
    public CartResponse updateItem(
            Long cItemsId,
            UpdateCartItemRequest request,
            Authentication authentication) {

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateCart(getAuthenticatedUser(authentication));

        CartItem item = cartItemRepository
                .findAllByCartCartId(cart.getCartId())
                .stream()
                .filter(cartItem -> cartItem.getCItemsId().equals(cItemsId))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        Integer stock = item.getProduct().getStockQuantity();

        if (stock == null || request.getQuantity() > stock) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        cartRepository.save(cart);

        return convertToResponse(cart);
    }

    // Remove one item from cart
    @Transactional
    public CartResponse removeItem(
            Long cItemsId,
            Authentication authentication) {

        Cart cart = getOrCreateCart(getAuthenticatedUser(authentication));

        CartItem item = cartItemRepository
                .findAllByCartCartId(cart.getCartId())
                .stream()
                .filter(cartItem -> cartItem.getCItemsId().equals(cItemsId))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        cartItemRepository.delete(item);
        cartRepository.save(cart);

        return convertToResponse(cart);
    }

    // Clear all items from cart
    @Transactional
    public CartResponse clearCart(Authentication authentication) {

        Cart cart = getOrCreateCart(getAuthenticatedUser(authentication));

        cartItemRepository.deleteAll(
                cartItemRepository.findAllByCartCartId(cart.getCartId())
        );

        cartRepository.save(cart);

        return convertToResponse(cart);
    }

    // Get authenticated user
    private User getAuthenticatedUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    // Find active cart or create a new one
    private Cart getOrCreateCart(User user) {

        return cartRepository
                .findByUserUserIdAndStatus(user.getUserId(), "ACTIVE")
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setStatus("ACTIVE");
                    return cartRepository.save(cart);
                });
    }

    // Convert product price to USD
    private BigDecimal convertToUsd(Product product) {

        BigDecimal price = product.getPrice();

        if (price == null) {
            throw new IllegalArgumentException("Product price is unavailable");
        }

        String currency = product.getCurrency();

        if (currency == null) {
            throw new IllegalArgumentException("Product currency is unavailable");
        }

        switch (currency.toUpperCase()) {

            case "USD":
                return price.setScale(2, RoundingMode.HALF_UP);

            case "INR":
                if (inrPerUsd == null || inrPerUsd.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalStateException("Invalid INR to USD conversion rate");
                }

                return price.divide(inrPerUsd, 2, RoundingMode.HALF_UP);

            default:
                throw new IllegalArgumentException(
                        "Unsupported product currency: " + currency);
        }
    }

    // Convert cart entity to response
    private CartResponse convertToResponse(Cart cart) {

        List<CartItemResponse> items = cartItemRepository
                .findAllByCartCartId(cart.getCartId())
                .stream()
                .map(this::convertItemToResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setCartId(cart.getCartId());
        response.setStatus(cart.getStatus());
        response.setItems(items);
        response.setTotalItems(totalItems);
        response.setTotalAmount(totalAmount);
        response.setCurrency("USD");
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());

        return response;
    }

    // Convert cart item entity to response
    private CartItemResponse convertItemToResponse(CartItem item) {

        Product product = item.getProduct();

        BigDecimal usdPrice = convertToUsd(product);

        CartItemResponse response = new CartItemResponse();

        response.setCItemsId(item.getCItemsId());
        response.setPId(product.getPId());
        response.setPName(product.getPName());
        response.setBrand(product.getBrand());
        response.setCategory(product.getCategory());
        response.setImageUrl(product.getImageUrl());

        response.setPrice(usdPrice);
        response.setCurrency("USD");
        response.setQuantity(item.getQuantity());

        response.setSubtotal(
                usdPrice.multiply(BigDecimal.valueOf(item.getQuantity()))
                        .setScale(2, RoundingMode.HALF_UP)
        );

        return response;
    }
}
