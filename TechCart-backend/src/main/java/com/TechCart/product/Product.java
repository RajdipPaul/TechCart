package com.TechCart.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_id")
    private Long pId;

    @Column(name = "p_name", nullable = false, length = 200)
    private String pName;

    private String brand;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    private String processor;

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "storage_type")
    private String storageType;

    private String graphics;

    @Column(name = "display_size_inches")
    private Double displaySizeInches;

    @Column(name = "display_reso")
    private String displayReso;

    @Column(name = "battery_wh")
    private Double batteryWh;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(columnDefinition = "TEXT")
    private String connectivity;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
