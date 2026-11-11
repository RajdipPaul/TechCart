
package com.TechCart.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.pId = :pId AND p.isActive = true")
    Optional<Product> findByPIdAndIsActiveTrue(@Param("pId") Long pId);

    List<Product> findByCategoryIgnoreCaseAndIsActiveTrue(String category);

    @Query("SELECT p FROM Product p WHERE LOWER(p.pName) LIKE LOWER(CONCAT('%', :pName, '%')) AND p.isActive = true")
    List<Product> findByPNameContainingIgnoreCaseAndIsActiveTrue(@Param("pName") String pName);

    List<Product> findByBrandIgnoreCaseAndIsActiveTrue(String brand);
}
