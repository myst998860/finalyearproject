package com.bookbridge.controller;

import com.bookbridge.model.Notification;
import com.bookbridge.model.User;
import com.bookbridge.service.NotificationService;
import com.bookbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
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
            Page<Notification> notificationsPage = notificationService.getUserNotificationsPaged(userOpt.get(), pageable);
            
            return ResponseEntity.ok(Map.of(
                "content", notificationsPage.getContent(),
                "totalElements", notificationsPage.getTotalElements(),
                "totalPages", notificationsPage.getTotalPages(),
                "currentPage", notificationsPage.getNumber(),
                "size", notificationsPage.getSize()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications() {
        try {
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
            
            List<Notification> unreadNotifications = notificationService.getUnreadNotifications(userOpt.get());
            Long unreadCount = notificationService.getUnreadNotificationCount(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "notifications", unreadNotifications,
                "unreadCount", unreadCount
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching unread notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getUnreadNotificationCount() {
        try {
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
            
            Long unreadCount = notificationService.getUnreadNotificationCount(userOpt.get());
            
            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching notification count: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error marking notification as read: " + e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        try {
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
            
            notificationService.markAllAsRead(userOpt.get());
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error marking all notifications as read: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting notification: " + e.getMessage()));
        }
    }
} 