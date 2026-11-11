package com.TechCart.cart.dto;

public class AddToCartRequest {

    private Long pId;
    private Integer quantity;

    public Long getPId() {
        return pId;
    }

    public void setPId(Long pId) {
        this.pId = pId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}