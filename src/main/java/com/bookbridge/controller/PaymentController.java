package com.bookbridge.controller;

import com.bookbridge.model.Order;
import com.bookbridge.model.Payment;
import com.bookbridge.model.User;
import com.bookbridge.service.OrderService;
import com.bookbridge.service.PaymentService;
import com.bookbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuthentication() {
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
            
            return ResponseEntity.ok(Map.of(
                "message", "Authentication successful",
                "userEmail", userEmail,
                "userId", userOpt.get().getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error testing authentication: " + e.getMessage()));
        }
    }

    @PostMapping("/esewa")
    public ResponseEntity<?> initiateEsewaPayment(
            @RequestBody Map<String, Object> paymentRequest) {
        
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
            
            Long orderId = Long.valueOf(paymentRequest.get("orderId").toString());
            
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            if (!orderOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order not found"));
            }
            
            Order order = orderOpt.get();
            
            // Check if user owns this order
            if (!order.getUser().getId().equals(userOpt.get().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only pay for your own orders"));
            }
            
            // Check if payment already exists
            Optional<Payment> existingPaymentOpt = paymentService.getPaymentByOrder(order);
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                if (existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Order already paid"));
                }
            }
            
            // Create payment
            Payment payment = paymentService.initiateEsewaPayment(order);
            Map<String, String> esewaParams = paymentService.getEsewaPaymentParams(payment);
            
            return ResponseEntity.ok(Map.of(
                "message", "Payment initiated successfully",
                "paymentId", payment.getPaymentId(),
                "esewaParams", esewaParams
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error initiating payment: " + e.getMessage()));
        }
    }

    @GetMapping("/esewa/success")
    public ResponseEntity<?> esewaSuccessCallback(
            @RequestParam("oid") String paymentId,
            @RequestParam("amt") String amount,
            @RequestParam("refId") String refId) {
        
        try {
            Payment payment = paymentService.verifyEsewaPayment(paymentId, refId);
            
            if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                return ResponseEntity.ok(Map.of(
                    "message", "Payment successful",
                    "paymentId", payment.getPaymentId(),
                    "status", payment.getStatus()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Payment verification failed",
                    "paymentId", payment.getPaymentId(),
                    "status", payment.getStatus()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing payment callback: " + e.getMessage()));
        }
    }

    @GetMapping("/esewa/failure")
    public ResponseEntity<?> esewaFailureCallback(
            @RequestParam("pid") String paymentId) {
        
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentByPaymentId(paymentId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentService.updatePaymentStatus(
                    paymentOpt.get().getId(), 
                    Payment.PaymentStatus.FAILED
                );
                
                return ResponseEntity.ok(Map.of(
                    "message", "Payment failed",
                    "paymentId", payment.getPaymentId(),
                    "status", payment.getStatus()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Payment not found"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing payment failure: " + e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestParam("paymentId") String paymentId) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentByPaymentId(paymentId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                return ResponseEntity.ok(Map.of(
                    "paymentId", payment.getPaymentId(),
                    "status", payment.getStatus(),
                    "amount", payment.getAmount(),
                    "orderId", payment.getOrder().getId(),
                    "createdAt", payment.getCreatedAt(),
                    "completedAt", payment.getCompletedAt()
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error verifying payment: " + e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<Payment> paymentOpt = paymentService.getPaymentByOrder(orderOpt.get());
            if (paymentOpt.isPresent()) {
                return ResponseEntity.ok(paymentOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching payment: " + e.getMessage()));
        }
    }
}
