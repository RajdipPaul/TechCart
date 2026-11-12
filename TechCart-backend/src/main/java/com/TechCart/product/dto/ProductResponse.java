package com.TechCart.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private Long pId;
    private String pName;
    private String brand;
    private String category;
    private String description;
    private BigDecimal price;
    private String currency;
    private Integer stockQuantity;
    private String imageUrl;
    private String processor;
    private Integer ramGb;
    private Integer storageGb;
    private String storageType;
    private String graphics;
    private Double displaySizeInches;
    private String displayReso;
    private Double batteryWh;
    private Double weightKg;
    private String connectivity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {
    }

    public Long getPId() { return pId; }
    public void setPId(Long pId) { this.pId = pId; }

    public String getPName() { return pName; }
    public void setPName(String pName) { this.pName = pName; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getProcessor() { return processor; }
    public void setProcessor(String processor) { this.processor = processor; }

    public Integer getRamGb() { return ramGb; }
    public void setRamGb(Integer ramGb) { this.ramGb = ramGb; }

    public Integer getStorageGb() { return storageGb; }
    public void setStorageGb(Integer storageGb) { this.storageGb = storageGb; }

    public String getStorageType() { return storageType; }
    public void setStorageType(String storageType) { this.storageType = storageType; }

    public String getGraphics() { return graphics; }
    public void setGraphics(String graphics) { this.graphics = graphics; }

    public Double getDisplaySizeInches() { return displaySizeInches; }
    public void setDisplaySizeInches(Double displaySizeInches) { this.displaySizeInches = displaySizeInches; }

    public String getDisplayReso() { return displayReso; }
    public void setDisplayReso(String displayReso) { this.displayReso = displayReso; }

    public Double getBatteryWh() { return batteryWh; }
    public void setBatteryWh(Double batteryWh) { this.batteryWh = batteryWh; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public String getConnectivity() { return connectivity; }
    public void setConnectivity(String connectivity) { this.connectivity = connectivity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
