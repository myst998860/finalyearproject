package com.bookbridge.controller;

import com.bookbridge.dto.OrderDTO;
import com.bookbridge.model.Order;
import com.bookbridge.model.User;
import com.bookbridge.service.EmailService;
import com.bookbridge.service.OrderService;
import com.bookbridge.service.PDFService;
import com.bookbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PDFService pdfService;

    @GetMapping
    public ResponseEntity<?> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Order> ordersPage = orderService.getUserOrdersPaged(userOpt.get(), pageable);
            
            // Convert to DTOs
            List<OrderDTO> orderDTOs = ordersPage.getContent().stream()
                    .map(OrderDTO::new)
                    .collect(Collectors.toList());
            
            // Create response with pagination info
            Map<String, Object> response = Map.of(
                "content", orderDTOs,
                "totalElements", ordersPage.getTotalElements(),
                "totalPages", ordersPage.getTotalPages(),
                "currentPage", ordersPage.getNumber(),
                "size", ordersPage.getSize(),
                "hasNext", ordersPage.hasNext(),
                "hasPrevious", ordersPage.hasPrevious()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Optional<Order> orderOpt = orderService.getOrderById(id);
            
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            
            // Check if user owns this order
            if (!order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only view your own orders"));
            }
            
            OrderDTO orderDTO = new OrderDTO(order);
            return ResponseEntity.ok(orderDTO);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching order: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> orderRequest) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            String deliveryAddress = orderRequest.get("deliveryAddress").toString();
            String deliveryPhone = orderRequest.get("deliveryPhone") != null ? 
                orderRequest.get("deliveryPhone").toString() : null;
            String deliveryNotes = orderRequest.get("deliveryNotes") != null ? 
                orderRequest.get("deliveryNotes").toString() : null;
            
            Order order = orderService.createOrderFromCart(userOpt.get(), deliveryAddress, deliveryPhone, deliveryNotes);
            
            // Send confirmation email
            emailService.sendOrderConfirmationEmail(
                userOpt.get().getEmail(), 
                userOpt.get().getFullName(), 
                order.getOrderNumber()
            );
            
            OrderDTO orderDTO = new OrderDTO(order);
            return ResponseEntity.ok(Map.of(
                "message", "Order created successfully",
                "order", orderDTO
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating order: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Optional<Order> orderOpt = orderService.getOrderById(id);
            
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            
            // Check if user owns this order
            if (!order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only cancel your own orders"));
            }
            
            orderService.cancelOrder(id);
            
            return ResponseEntity.ok(Map.of("message", "Order cancelled successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error cancelling order: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<?> downloadOrderPDF(@PathVariable Long id) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Optional<Order> orderOpt = orderService.getOrderById(id);
            
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            
            // Check if user owns this order
            if (!order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only download your own order PDFs"));
            }
            
            // Generate PDF
            byte[] pdfBytes = pdfService.generateOrderInvoice(order);
            
            // Set headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "order-" + order.getOrderNumber() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating PDF: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testOrdersAPI() {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User user = userOpt.get();
            List<Order> userOrders = orderService.getOrdersByUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Orders API test successful",
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "ordersCount", userOrders.size(),
                "orders", userOrders.stream().map(OrderDTO::new).collect(Collectors.toList())
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Orders API test failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/payment-status")
    public ResponseEntity<?> getOrderPaymentStatus(@PathVariable Long id) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Optional<Order> orderOpt = orderService.getOrderById(id);
            
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            
            // Check if user owns this order
            if (!order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only view your own orders"));
            }
            
            // Check payment status
            boolean isPaid = order.getStatus() == Order.OrderStatus.CONFIRMED;
            
            return ResponseEntity.ok(Map.of(
                "orderId", order.getId(),
                "orderNumber", order.getOrderNumber(),
                "orderStatus", order.getStatus(),
                "isPaid", isPaid,
                "totalAmount", order.getTotalAmount()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking payment status: " + e.getMessage()));
        }
    }
}
