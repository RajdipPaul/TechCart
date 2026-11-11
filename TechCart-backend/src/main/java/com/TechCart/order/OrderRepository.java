package com.TechCart.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderIdAndUserUserId(Long orderId, Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByPaypalOrderId(String paypalOrderId);
}
