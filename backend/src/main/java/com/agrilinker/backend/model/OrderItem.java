package com.agrilinker.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

public class OrderItem {

    private String productId;
    private String fertilizerId;
    private String name;

    @Min(1)
    private int quantity;

    @PositiveOrZero
    private double price;
    private String farmerEmail;

    // Getters & Setters
    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getFertilizerId() {
        return fertilizerId;
    }

    public void setFertilizerId(String fertilizerId) {
        this.fertilizerId = fertilizerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getfarmerEmail() {
        return farmerEmail;
    }

    public void setfarmerEmail(String farmerEmail) {
        this.farmerEmail = farmerEmail;
    }

}
