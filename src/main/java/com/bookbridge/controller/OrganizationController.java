package com.bookbridge.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookbridge.config.JwtUtil;
import com.bookbridge.model.User;
import com.bookbridge.service.BookService;
import com.bookbridge.service.OrderService;
import com.bookbridge.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/organization")
public class OrganizationController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private OrderService orderService;
    
  
    @Autowired
    private JwtUtil jwtUtil;
    
    private boolean isOrganizationAuthenticated(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractUsername(token);
                
                if (email != null && !jwtUtil.extractExpiration(token).before(new java.util.Date())) {
                    Optional<User> userOpt = userService.getUserByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        return user.getUserType() == User.UserType.ORGANIZATION;
                    }
                }
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }
    
    @GetMapping("/analytics/orders")
    public ResponseEntity<?> getOrderAnalytics(HttpServletRequest request) {
        if (!isOrganizationAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Organization authentication required"));
        }
        
        try {
            // For now, use the same global analytics
            // This will compile since we're using existing methods
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Use existing global methods
            analytics.put("totalOrders", orderService.countAllOrders());
            analytics.put("ordersThisMonth", orderService.countOrdersCreatedAfter(startOfMonth));
            analytics.put("ordersThisYear", orderService.countOrdersCreatedAfter(startOfYear));
            
            // ... rest of the analytics
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching order analytics: " + e.getMessage()));
        }
    }
}