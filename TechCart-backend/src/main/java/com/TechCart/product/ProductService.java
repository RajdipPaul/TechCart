package com.TechCart.product;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.TechCart.product.dto.ProductResponse;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET ALL ACTIVE PRODUCTS
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET PRODUCT BY ID
    public Optional<ProductResponse> getProductById(Long pId) {

        return productRepository.findByPIdAndIsActiveTrue(pId)
                .map(this::convertToResponse);
    }

    // GET PRODUCTS BY CATEGORY
    public List<ProductResponse> getProductsByCategory(String category) {

        return productRepository
                .findByCategoryIgnoreCaseAndIsActiveTrue(category.trim())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // SEARCH PRODUCTS BY NAME
    public List<ProductResponse> searchProducts(String keyword) {

        return productRepository
                .findByPNameContainingIgnoreCaseAndIsActiveTrue(keyword.trim())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET PRODUCTS BY BRAND
    public List<ProductResponse> getProductsByBrand(String brand) {

        return productRepository
                .findByBrandIgnoreCaseAndIsActiveTrue(brand.trim())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // CONVERT PRODUCT ENTITY TO RESPONSE
    private ProductResponse convertToResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setPId(product.getPId());
        response.setPName(product.getPName());
        response.setBrand(product.getBrand());
        response.setCategory(product.getCategory());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCurrency(product.getCurrency());
        response.setStockQuantity(product.getStockQuantity());
        response.setImageUrl(product.getImageUrl());
        response.setProcessor(product.getProcessor());
        response.setRamGb(product.getRamGb());
        response.setStorageGb(product.getStorageGb());
        response.setStorageType(product.getStorageType());
        response.setGraphics(product.getGraphics());
        response.setDisplaySizeInches(product.getDisplaySizeInches());
        response.setDisplayReso(product.getDisplayReso());
        response.setBatteryWh(product.getBatteryWh());
        response.setWeightKg(product.getWeightKg());
        response.setConnectivity(product.getConnectivity());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        return response;
    }
}
