package com.bookbridge.controller;

import com.bookbridge.model.User;
import com.bookbridge.service.FileStorageService;
import com.bookbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                // Return public profile information
                Map<String, Object> profile = Map.of(
                    "id", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "userType", user.getUserType(),
                    "location", user.getLocation() != null ? user.getLocation() : "",
                    "profileImage", user.getProfileImage(),
                    "createdAt", user.getCreatedAt(),
                    "organizationName", user.getOrganizationName() != null ? user.getOrganizationName() : ""
                );
                
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        
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
            
            // Update profile fields
            if (fullName != null) {
                user.setFullName(fullName);
            }
            if (location != null) {
                user.setLocation(location);
            }
            if (phone != null) {
                user.setPhone(phone);
            }
            
            // Update profile image if provided
            if (profileImage != null && !profileImage.isEmpty()) {
                // Delete old profile image if exists
                if (user.getProfileImage() != null) {
                    fileStorageService.deleteFile(user.getProfileImage());
                }
                String imagePath = fileStorageService.storeProfileImage(profileImage);
                user.setProfileImage(imagePath);
            }
            
            User updatedUser = userService.updateUser(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "fullName", updatedUser.getFullName(),
                    "email", updatedUser.getEmail(),
                    "location", updatedUser.getLocation(),
                    "phone", updatedUser.getPhone(),
                    "profileImage", updatedUser.getProfileImage()
                )
            ));
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload profile image"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating profile: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwordRequest) {
        
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
            String oldPassword = passwordRequest.get("oldPassword");
            String newPassword = passwordRequest.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Old password and new password are required"));
            }
            
            boolean success = userService.changePassword(user.getId(), oldPassword, newPassword);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid old password"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error changing password: " + e.getMessage()));
        }
    }
}
