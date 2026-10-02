package com.agrilinker.backend.service.impl;

import com.agrilinker.backend.model.FarmerStatsDTO;
import com.agrilinker.backend.model.Order;
import com.agrilinker.backend.repository.NotificationRepository;
import com.agrilinker.backend.repository.OrderRepository;
import com.agrilinker.backend.service.OrderService;
import com.agrilinker.backend.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.agrilinker.backend.util.OrderNumberGenerator;
import org.springframework.dao.DuplicateKeyException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

import com.agrilinker.backend.notifications.NotificationSseService;
import com.agrilinker.backend.repository.ProductRepository;
import com.agrilinker.backend.model.Product;
import com.agrilinker.backend.model.OrderItem;
import com.agrilinker.backend.model.Notification;
import com.agrilinker.backend.repository.FertilizerRepository;
import com.agrilinker.backend.model.Fertilizer;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final NotificationSseService sse;
    //
    private final ProductService productService;

    private final NotificationRepository notificationRepository;
    private final FertilizerRepository fertilizerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Order createOrder(Order order) {

        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }

        // attach farmer emails + update stock
        for (OrderItem item : order.getItems()) {

            String farmerEmail = null;

            // ---------- PRODUCT ----------
            if (item.getProductId() != null && !item.getProductId().isBlank()) {

                Optional<Product> productOpt = productRepository.findById(item.getProductId());

                if (productOpt.isPresent()) {

                    Product product = productOpt.get();
                    farmerEmail = product.getfarmerEmail();

                    int newQty = product.getQuantity() - item.getQuantity();
                    product.setQuantity(newQty);
                    productRepository.save(product);
                }
            }

            // ---------- FERTILIZER ----------
            if (item.getFertilizerId() != null && !item.getFertilizerId().isBlank()) {

                Optional<Fertilizer> fertOpt = fertilizerRepository.findById(item.getFertilizerId());

                if (fertOpt.isPresent()) {

                    Fertilizer fert = fertOpt.get();
                    farmerEmail = fert.getSupplierEmail();

                    if (fert.getStock() != null) {
                        fert.setStock(fert.getStock() - item.getQuantity());
                        fertilizerRepository.save(fert);
                    }
                }
            }

            System.out.println("Detected farmer email = " + farmerEmail);
            item.setfarmerEmail(farmerEmail);
        }

        Order saved;

        // generate unique order number safely
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {

            while (true) {
                try {
                    order.setOrderNumber(OrderNumberGenerator.generate());
                    saved = orderRepository.save(order);
                    break;
                } catch (DuplicateKeyException e) {
                }
            }

        } else {
            saved = orderRepository.save(order);
        }

        // CUSTOMER NOTIFICATION
        Notification customerNotification = Notification.builder()
                .userEmail(saved.getCustomer().getEmail())
                .title("Order Placed ✅")
                .message("Your order #" + saved.getOrderNumber()
                        + " has been placed successfully. The farmer will prepare your items soon.")
                .type("ORDER")
                .referenceId(saved.getId())
                .read(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        notificationRepository.save(customerNotification);
        sse.sendToUser(customerNotification.getUserEmail(), customerNotification);

        // FARMER NOTIFICATIONS
        for (OrderItem item : saved.getItems()) {

            if (item.getfarmerEmail() != null && !item.getfarmerEmail().isBlank()) {

                Notification farmerNotification = Notification.builder()
                        .userEmail(item.getfarmerEmail())
                        .title("New Order Alert 📦")
                        .message("A customer placed order #" + saved.getOrderNumber())
                        .type("ORDER")
                        .referenceId(saved.getId())
                        .read(false)
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

                notificationRepository.save(farmerNotification);
                sse.sendToUser(farmerNotification.getUserEmail(), farmerNotification);
            }
        }

        return saved;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(String id) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        return optionalOrder.orElse(null);
    }

    @Override
public Order updateOrder(String id, Order order) {

    Order existingOrder = getOrderById(id);

    if (existingOrder == null) {
        return null;
    }

    // Only allow status/payment status updates
    if (order.getStatus() != null) {
        existingOrder.setStatus(order.getStatus());
    }

    if (order.getPaymentStatus() != null) {
        existingOrder.setPaymentStatus(order.getPaymentStatus());
    }

    // Keep original customer, items, amount, payment method and date
    return orderRepository.save(existingOrder);
}

    @Override
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }

    @Override
    public List<Order> getOrdersByUserEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    // farmer
    @Override
    public List<Order> getOrdersByFarmerEmail(String farmerEmail) {
        return orderRepository.findByFarmerEmail(farmerEmail);
    }

    @Override
    public FarmerStatsDTO getFarmerStats(String farmerEmail) {
        // Farmer ge analisis states
        List<Order> farmerOrders = orderRepository.findByFarmerEmail(farmerEmail);

        double totalSales = 0;
        long completedOrdersCount = 0;
        int totalProductsSold = 0;
        double pendingPayments = 0;
        int pendingOrders = 0;

        for (Order order : farmerOrders) {
            double farmerOrderSubtotal = 0;
            int farmerItemCount = 0;

            // Order එකේ තියෙන items වලින් මේ farmer ට අයිති ඒවා විතරක් filter කරනවා
            for (OrderItem item : order.getItems()) {
                if (farmerEmail.equals(item.getfarmerEmail())) {
                    double itemTotal = item.getPrice() * item.getQuantity();
                    farmerOrderSubtotal += itemTotal;
                    farmerItemCount += item.getQuantity();
                }
            }

            // Calculation Logic
            if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                totalSales += farmerOrderSubtotal;
                completedOrdersCount++;
                totalProductsSold += farmerItemCount;
            } else if ("PENDING".equalsIgnoreCase(order.getStatus())) {
                pendingPayments += farmerOrderSubtotal;
                pendingOrders++;
            }
        }

        // Average Order Value (AOV)
        double averageOrderValue = (completedOrdersCount > 0) ? totalSales / completedOrdersCount : 0;

        return new FarmerStatsDTO(
                totalSales,
                completedOrdersCount,
                averageOrderValue,
                totalProductsSold,
                pendingPayments,
                pendingOrders);
    }

    @Override
    public Map<String, Double> getPaymentBreakdown(String farmerEmail) {
        List<Order> orders = orderRepository.findByFarmerEmail(farmerEmail);

        double paid = 0;
        double pending = 0;

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                if (farmerEmail.equals(item.getfarmerEmail())) {
                    double itemTotal = item.getPrice() * item.getQuantity();
                    if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                        paid += itemTotal;
                    } else if ("PENDING".equalsIgnoreCase(order.getStatus())) {
                        pending += itemTotal;
                    }
                }
            }
        }

        Map<String, Double> result = new HashMap<>();
        result.put("PAID", paid);
        result.put("PENDING", pending);
        return result;
    }

    @Override
    public List<Double> getMonthlySales(String farmerEmail) {

        List<Order> orders = orderRepository.findCompletedOrdersByFarmerEmail(farmerEmail);

        List<Double> monthlySales = new ArrayList<>();

        // initialize 12 months with 0
        for (int i = 0; i < 12; i++) {
            monthlySales.add(0.0);
        }

        for (Order order : orders) {

            int month = order.getOrderDate().getMonth(); // 0-11

            for (OrderItem item : order.getItems()) {

                if (farmerEmail.equals(item.getfarmerEmail())) {

                    double total = item.getPrice() * item.getQuantity();

                    monthlySales.set(
                            month,
                            monthlySales.get(month) + total);
                }
            }
        }

        return monthlySales;
    }

}
