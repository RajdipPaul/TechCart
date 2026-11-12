
package com.TechCart.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.TechCart.cart.Cart;
import com.TechCart.cart.CartItem;
import com.TechCart.cart.CartItemRepository;
import com.TechCart.cart.CartRepository;
import com.TechCart.order.dto.CreateOrderRequest;
import com.TechCart.order.dto.OrderItemResponse;
import com.TechCart.order.dto.OrderResponse;
import com.TechCart.product.Product;
import com.TechCart.product.ProductRepository;
import com.TechCart.user.User;
import com.TechCart.user.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PayPalService paypalService;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PayPalService paypalService) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.paypalService = paypalService;
    }

    // ------------------------------------------------
    // CREATE TECHCART ORDER
    // ------------------------------------------------

    @Transactional
    public OrderResponse createOrder(
            CreateOrderRequest request,
            Authentication authentication) {

        if (request == null
                || isBlank(request.getShippingAddress())
                || isBlank(request.getPostalCode())
                || isBlank(request.getCountry())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Shipping address, postal code and country are required.");
        }

        User user = getAuthenticatedUser(authentication);

        Cart cart = cartRepository
                .findByUserUserIdAndStatus(user.getUserId(), "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No active cart found."));

        List<CartItem> cartItems =
                cartItemRepository.findAllByCartCartId(cart.getCartId());

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your cart is empty.");
        }

        Order order = new Order();

        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setCustomerName(user.getFullName());
        order.setCustomerMail(user.getEmail());
        order.setCustomerPhone(user.getPhoneNumber());
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setPostalCode(request.getPostalCode().trim());
        order.setCountry(request.getCountry().trim());
        order.setOrderStatus("PENDING");
        order.setPaymentStatus("PENDING");

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        String currency = null;

        for (CartItem cartItem : cartItems) {

            Integer quantity = cartItem.getQuantity();

            if (quantity == null || quantity <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid cart item quantity.");
            }

            Long pId = cartItem.getProduct().getPId();

            Product product = productRepository
                    .findByPIdAndIsActiveTrue(pId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "A product in your cart is unavailable."));

            if (product.getStockQuantity() == null
                    || product.getStockQuantity() < quantity) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getPName());
            }

            if (product.getPrice() == null
                    || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid price for " + product.getPName());
            }

            if (isBlank(product.getCurrency())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Currency is missing for " + product.getPName());
            }

            if (currency == null) {
                currency = product.getCurrency();
            } else if (!currency.equalsIgnoreCase(product.getCurrency())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "All products in an order must use the same currency.");
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setPName(product.getPName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);
        }

        order.setCurrency(currency);
        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        return convertToResponse(savedOrder);
    }

    // ------------------------------------------------
    // CREATE PAYPAL CHECKOUT
    // ------------------------------------------------

    @Transactional
    public Map<String, Object> createPayPalCheckout(
            Long orderId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        Order order = getUserOrder(orderId, user.getUserId());

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This order has already been paid.");
        }

        if (!"PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This order is not available for payment.");
        }

        if (order.getPaypalOrderId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A PayPal payment has already been created for this order.");
        }

        // Revalidate current product availability before checkout.
        for (OrderItem item : order.getOrderItems()) {

            Product product = productRepository
                    .findByPIdAndIsActiveTrue(item.getProduct().getPId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "A product in this order is no longer available."));

            if (product.getStockQuantity() == null
                    || product.getStockQuantity() < item.getQuantity()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + item.getPName());
            }
        }

        // Convert the INR order total into USD for PayPal.
        BigDecimal paypalAmount = paypalService.convertInrToUsd(
                order.getTotalAmount(),
                order.getCurrency());

        Map<String, Object> paypalResponse =
                paypalService.createPayPalOrder(
                        paypalAmount,
                        "USD",
                        order.getOrderNumber());

        String paypalOrderId = (String) paypalResponse.get("id");

        if (isBlank(paypalOrderId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal did not return an order ID.");
        }

        String approvalUrl = null;

        Object linksObject = paypalResponse.get("links");

        if (linksObject instanceof List<?> links) {
            for (Object linkObject : links) {
                if (linkObject instanceof Map<?, ?> link) {
                    if ("approve".equals(link.get("rel"))
                            || "payer-action".equals(link.get("rel"))) {

                        approvalUrl = (String) link.get("href");
                        break;
                    }
                }
            }
        }

        if (isBlank(approvalUrl)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal approval URL was not returned.");
        }

        order.setPaypalOrderId(paypalOrderId);
        orderRepository.save(order);

        return Map.of(
                "orderId", order.getOrderId(),
                "orderNumber", order.getOrderNumber(),
                "paypalOrderId", paypalOrderId,
                "approvalUrl", approvalUrl,
                "techCartAmount", order.getTotalAmount(),
                "techCartCurrency", order.getCurrency(),
                "paypalAmount", paypalAmount,
                "paypalCurrency", "USD",
                "paymentStatus", order.getPaymentStatus()
        );
    }

    // ------------------------------------------------
    // CAPTURE PAYPAL PAYMENT
    // ------------------------------------------------

    @Transactional
    public OrderResponse capturePayPalPayment(
            Long orderId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        Order order = getUserOrder(orderId, user.getUserId());

        // Prevent duplicate stock deduction.
        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            return convertToResponse(order);
        }

        if (isBlank(order.getPaypalOrderId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No PayPal payment has been created for this order.");
        }

        if (!"PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This order cannot be captured.");
        }

        Map<String, Object> captureResponse;

        try {
            captureResponse = paypalService.capturePayPalOrder(
                    order.getPaypalOrderId());
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to capture PayPal payment. Please check payment status before retrying.");
        }

        String paypalStatus = (String) captureResponse.get("status");

        if (!"COMPLETED".equalsIgnoreCase(paypalStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "PayPal payment has not been completed.");
        }

        // Extract the actual captured payment details.
        String captureId = null;
        String captureStatus = null;
        String capturedAmount = null;
        String capturedCurrency = null;

        Object purchaseUnitsObject = captureResponse.get("purchase_units");

        if (purchaseUnitsObject instanceof List<?> purchaseUnits
                && !purchaseUnits.isEmpty()
                && purchaseUnits.get(0) instanceof Map<?, ?> purchaseUnit) {

            Object paymentsObject = purchaseUnit.get("payments");

            if (paymentsObject instanceof Map<?, ?> payments) {

                Object capturesObject = payments.get("captures");

                if (capturesObject instanceof List<?> captures
                        && !captures.isEmpty()
                        && captures.get(0) instanceof Map<?, ?> capture) {

                    captureId = (String) capture.get("id");
                    captureStatus = (String) capture.get("status");

                    Object amountObject = capture.get("amount");

                    if (amountObject instanceof Map<?, ?> amount) {
                        capturedAmount = (String) amount.get("value");
                        capturedCurrency =
                                (String) amount.get("currency_code");
                    }
                }
            }
        }

        if (isBlank(captureId)
                || !"COMPLETED".equalsIgnoreCase(captureStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal capture details could not be verified.");
        }

        // Convert the original INR total using the same configured rate.
        BigDecimal expectedPayPalAmount = paypalService.convertInrToUsd(
                order.getTotalAmount(),
                order.getCurrency());

        BigDecimal actualAmount;

        try {
            actualAmount = new BigDecimal(capturedAmount);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Invalid payment amount returned by PayPal.");
        }

        // Verify the actual captured USD amount and currency.
        if (actualAmount.compareTo(expectedPayPalAmount) != 0
                || !"USD".equalsIgnoreCase(capturedCurrency)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Captured payment amount or currency does not match the expected PayPal amount.");
        }

        // Recheck stock before deducting it.
        for (OrderItem item : order.getOrderItems()) {

            Product product = productRepository
                    .findByPIdAndIsActiveTrue(item.getProduct().getPId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "A product is no longer available. Contact support."));

            if (product.getStockQuantity() == null
                    || product.getStockQuantity() < item.getQuantity()) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for " + item.getPName()
                                + ". Payment was captured; manual resolution is required.");
            }

            product.setStockQuantity(
                    product.getStockQuantity() - item.getQuantity());

            productRepository.save(product);
        }

        // Mark the order as paid only after PayPal verification.
        order.setPaypalCaptureId(captureId);
        order.setPaymentStatus("PAID");
        order.setOrderStatus("CONFIRMED");
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Clear the cart after successful payment.
        Cart cart = cartRepository
                .findByUserUserIdAndStatus(user.getUserId(), "ACTIVE")
                .orElse(null);

        if (cart != null) {
            cartItemRepository.deleteAllByCartCartId(cart.getCartId());
        }

        return convertToResponse(savedOrder);
    }

    // ------------------------------------------------
    // GET ALL USER ORDERS
    // ------------------------------------------------

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return orderRepository
                .findByUserUserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // ------------------------------------------------
    // GET ORDER BY ID
    // ------------------------------------------------

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(
            Long orderId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        Order order = getUserOrder(orderId, user.getUserId());

        return convertToResponse(order);
    }

    // ------------------------------------------------
    // HELPER METHODS
    // ------------------------------------------------

    private User getAuthenticatedUser(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found."));
    }

    private Order getUserOrder(Long orderId, Long userId) {

        return orderRepository
                .findByOrderIdAndUserUserId(orderId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found."));
    }

    private String generateOrderNumber() {
        return "TC-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setOrderId(order.getOrderId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerMail(order.getCustomerMail());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setShippingAddress(order.getShippingAddress());
        response.setPostalCode(order.getPostalCode());
        response.setCountry(order.getCountry());
        response.setTotalAmount(order.getTotalAmount());
        response.setCurrency(order.getCurrency());
        response.setOrderStatus(order.getOrderStatus());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setPaypalOrderId(order.getPaypalOrderId());
        response.setPaypalCaptureId(order.getPaypalCaptureId());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemResponse> items = order.getOrderItems()
                .stream()
                .map(this::convertItemToResponse)
                .toList();

        response.setItems(items);

        return response;
    }

    private OrderItemResponse convertItemToResponse(OrderItem item) {

        OrderItemResponse response = new OrderItemResponse();

        response.setOItemId(item.getOItemId());
        response.setPId(item.getProduct().getPId());
        response.setPName(item.getPName());
        response.setImageUrl(item.getProduct().getImageUrl());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setSubtotal(item.getSubtotal());
        response.setCurrency(item.getOrder().getCurrency());

        return response;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Transactional
    public void cancelOrDeleteOrder(
            Long orderId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        Order order = getUserOrder(orderId, user.getUserId());

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Paid orders cannot be deleted.");
        }

        orderRepository.delete(order);
    }
}
