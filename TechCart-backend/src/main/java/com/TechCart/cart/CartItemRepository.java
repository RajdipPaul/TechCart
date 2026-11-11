
package com.TechCart.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findAllByCartCartId(Long cartId);

    @Query("SELECT c FROM CartItem c JOIN c.product p " +
           "WHERE c.cart.cartId = :cartId AND p.pId = :pId")
    Optional<CartItem> findByCartCartIdAndProductPId(
            @Param("cartId") Long cartId,
            @Param("pId") Long pId
    );

    void deleteAllByCartCartId(Long cartId);
}
