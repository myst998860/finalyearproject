package com.bookbridge.controller;

import com.bookbridge.config.JwtUtil;
import com.bookbridge.model.User;
import com.bookbridge.service.EmailService;
import com.bookbridge.service.FileStorageService;
import com.bookbridge.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private EmailService emailService;

    @PostMapping("/register/individual")
    public ResponseEntity<?> registerIndividual(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "idCardNumber", required = false) String idCardNumber,
            @RequestParam("idCardPhoto") MultipartFile idCardPhoto,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "phone", required = false) String phone,
            HttpServletRequest request) {
        
        try {
            // Check if email is already taken
            if (userService.isEmailTaken(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
            }
            
            // Store ID card photo
            String idCardPhotoPath = fileStorageService.storeIdCardImage(idCardPhoto);
            
            // Create user
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPassword(password); // Will be encoded in service
            user.setUserType(User.UserType.INDIVIDUAL);
            if (idCardNumber != null && !idCardNumber.trim().isEmpty()) {
                user.setIdCardNumber(idCardNumber);
            }
            user.setIdCardPhoto(idCardPhotoPath);
            user.setLocation(location);
            user.setPhone(phone);
            
            User savedUser = userService.registerIndividualUser(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail());
            
            // Store token in session
            HttpSession session = request.getSession();
            session.setAttribute("token", token);
            session.setAttribute("userId", savedUser.getId());
            
            // Send welcome email
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Individual user registered successfully");
            response.put("token", token);
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "email", savedUser.getEmail(),
                "userType", savedUser.getUserType()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload ID card photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }
    

    @PostMapping("/register/organization")
    public ResponseEntity<?> registerOrganization(
            @RequestParam("organizationName") String organizationName,
            @RequestParam("contactPerson") String contactPerson,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("businessRegistrationNumber") String businessRegistrationNumber,
            @RequestParam("panNumber") String panNumber,
            @RequestParam("documentPhoto") MultipartFile documentPhoto,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "phone", required = false) String phone,
            HttpServletRequest request) {
        
        try {
            // Check if email is already taken
            if (userService.isEmailTaken(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
            }
            
            // Store document photo
            String documentPhotoPath = fileStorageService.storeDocumentImage(documentPhoto);
            
            // Create user
            User user = new User();
            user.setOrganizationName(organizationName);
            user.setContactPerson(contactPerson);
            user.setFullName(contactPerson); // Use contact person as full name
            user.setEmail(email);
            user.setPassword(password); // Will be encoded in service
            user.setUserType(User.UserType.ORGANIZATION);
            user.setBusinessRegistrationNumber(businessRegistrationNumber);
            user.setPanNumber(panNumber);
            user.setDocumentPhoto(documentPhotoPath);
            user.setLocation(location);
            user.setPhone(phone);
            
            User savedUser = userService.registerOrganizationUser(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail());
            
            // Store token in session
            HttpSession session = request.getSession();
            session.setAttribute("token", token);
            session.setAttribute("userId", savedUser.getId());
            
            // Send welcome email
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Organization registered successfully");
            response.put("token", token);
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "email", savedUser.getEmail(),
                "userType", savedUser.getUserType(),
                "organizationName", savedUser.getOrganizationName()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload document photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if user is blocked
            if (user.getStatus() == User.UserStatus.BLOCKED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Your account has been blocked"));
            }
            
            // Verify password
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getEmail());
                
                // Store token in session
                HttpSession session = request.getSession();
                session.setAttribute("token", token);
                session.setAttribute("userId", user.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("user", Map.of(
                    "id", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "userType", user.getUserType()
                ));
                
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> initiatePasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        
        boolean success = userService.initiatePasswordReset(token, email);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset email sent"+token));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Email not found"));
        }
    }

    @PostMapping("/password/reset/complete")
    public ResponseEntity<?> completePasswordReset(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        boolean success = userService.completePasswordReset(token, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            // Get current user from Spring Security context
            String userEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User user = userOpt.get();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("fullName", user.getFullName());
            userInfo.put("email", user.getEmail());
            userInfo.put("userType", user.getUserType());
            userInfo.put("location", user.getLocation());
            userInfo.put("phone", user.getPhone());
            
            return ResponseEntity.ok(userInfo);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching user info: " + e.getMessage()));
        }
    }

    @GetMapping("/auth/test")
    public ResponseEntity<?> testAuthentication() {
        return ResponseEntity.ok(Map.of(
            "message", "Authentication successful",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
