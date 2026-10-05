package com.agrilinker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed(unique = true) //  makes sure orderNumber can't duplicate
    private String orderNumber;

    @Valid
    private Customer customer;

    @Valid
    private List<OrderItem> items;

    @PositiveOrZero
    private double totalAmount;
    private String paymentMethod;
    private Date orderDate = new Date();
    private String farmerEmail;
    //new
    private String status;
    private String paymentStatus;


    public Order() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    } // ✅ ADD THIS

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public String getfarmerEmail() {
        return farmerEmail;
    }

    public void setfarmerEmail(String farmerEmail) {
        this.farmerEmail = farmerEmail;
    }

    //new
    public String getStatus() {
    return status;
    }

public void setStatus(String status) {
    this.status = status;
}

public String getPaymentStatus() {
    return paymentStatus;
}

public void setPaymentStatus(String paymentStatus) {
    this.paymentStatus = paymentStatus;
}


}
