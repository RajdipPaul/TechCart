
package com.TechCart.order;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TechCart.order.dto.CreateOrderRequest;
import com.TechCart.order.dto.OrderResponse;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create a TechCart order from the active cart.
    @PostMapping
    public OrderResponse createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        return orderService.createOrder(request, authentication);
    }

    // Create a PayPal Sandbox checkout for an existing order.
    @PostMapping("/{orderId}/paypal/create")
    public Map<String, Object> createPayPalCheckout(
            @PathVariable Long orderId,
            Authentication authentication) {

        return orderService.createPayPalCheckout(
                orderId, authentication);
    }

    // Capture the approved PayPal payment.
    @PostMapping("/{orderId}/paypal/capture")
    public OrderResponse capturePayPalPayment(
            @PathVariable Long orderId,
            Authentication authentication) {

        return orderService.capturePayPalPayment(
                orderId, authentication);
    }

    // Get all orders belonging to the logged-in user.
    @GetMapping
    public List<OrderResponse> getAllOrders(
            Authentication authentication) {

        return orderService.getAllOrders(authentication);
    }

    // Get one order belonging to the logged-in user.
    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        return orderService.getOrderById(
                orderId, authentication);
    }
}
