package com.agrilinker.backend.controller;

import com.agrilinker.backend.model.FarmerStatsDTO;
import com.agrilinker.backend.model.Order;
import com.agrilinker.backend.service.InvoiceService;
import com.agrilinker.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import com.agrilinker.backend.repository.OrderRepository;
import com.agrilinker.backend.security.JwtAuthenticationFilter;
import com.agrilinker.backend.security.*;


import org.springframework.security.core.AuthenticationException;
//new
import java.util.Map;

import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody Order order) {
        Order savedOrder = orderService.createOrder(order);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Order order = orderService.getOrderById(id);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @Valid @RequestBody Order order) {
        Order updatedOrder = orderService.updateOrder(id, order);
        return updatedOrder != null ? ResponseEntity.ok(updatedOrder) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{orderNumber}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderNumber) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        byte[] pdf = invoiceService.generateInvoicePdf(order);

        String filename = "invoice-" + orderNumber + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/user/{email}")
public ResponseEntity<List<Order>> getOrdersByUserEmail(
        @PathVariable String email,
        Principal principal) {

    // Get the email of the currently authenticated user
    String authenticatedEmail = principal.getName();

    // Prevent users from accessing another user's orders
    if (!authenticatedEmail.equalsIgnoreCase(email)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    List<Order> orders = orderService.getOrdersByUserEmail(email);
    return ResponseEntity.ok(orders);
}

    @GetMapping("/farmer")
public ResponseEntity<List<Order>> getFarmerOrders(Principal principal) {

    String farmerEmail = principal.getName();

    List<Order> orders = orderService.getOrdersByFarmerEmail(farmerEmail);

    return ResponseEntity.ok(orders);
}

    @GetMapping("/farmer/{email}")
    public ResponseEntity<List<Order>> getFarmerOrdersByEmail(@PathVariable String email) {
    List<Order> orders = orderService.getOrdersByFarmerEmail(email);
    return ResponseEntity.ok(orders);
}

     //new
     @GetMapping("/sales-history/{email}")
       public ResponseEntity<List<Map<String, Object>>>getSalesHistory(
        @PathVariable String email,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month) {

    // 1. මුලින්ම එම ගොවියාගේ COMPLETED ඕඩර්ස් ඔක්කොම ගන්නවා
    List<Order> orders = orderRepository.findCompletedOrdersByFarmerEmail(email);

    // 2. Year සහ Month අනුව Filter කරනවා
    List<Order> filteredOrders = orders.stream().filter(order -> {
        boolean matchesYear = (year == null) || (order.getOrderDate().getYear() + 1900 == year);
        boolean matchesMonth = (month == null) || (order.getOrderDate().getMonth() + 1 == month);
        return matchesYear && matchesMonth;
    }).toList();

    // 3. Flat map items to a Map (no DTO)
    List<Map<String, Object>> report = filteredOrders.stream()
            .flatMap(order -> order.getItems().stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("orderNumber", order.getOrderNumber());
                        map.put("orderDate", order.getOrderDate());
                        map.put("product", item.getName());
                        map.put("quantity", item.getQuantity());
                        map.put("amount", item.getPrice() * item.getQuantity());
                        map.put("paymentMethod", order.getPaymentMethod());
                        map.put("status", order.getStatus());
                        return map;
                    })
            )
            .toList();


    

    return ResponseEntity.ok(report);

    }



    @GetMapping("/farmer-stats/{email}")
    public ResponseEntity<FarmerStatsDTO> getStats(@PathVariable String email) {
    return ResponseEntity.ok(orderService.getFarmerStats(email));
} 
 @GetMapping("/farmer/payment-breakdown/{email}")
public ResponseEntity<Map<String, Double>> getPaymentBreakdown(@PathVariable String email) {
    return ResponseEntity.ok(orderService.getPaymentBreakdown(email));
}




@GetMapping("/farmer/monthly-sales/{email}")
public ResponseEntity<List<Double>> getMonthlySales(@PathVariable String email) {
    return ResponseEntity.ok(orderService.getMonthlySales(email));
}


}
