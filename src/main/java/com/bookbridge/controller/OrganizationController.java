package com.bookbridge.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookbridge.config.JwtUtil;
import com.bookbridge.model.Tutorial;
import com.bookbridge.model.User;
import com.bookbridge.repository.TutorialRepository;
import com.bookbridge.service.BookService;
import com.bookbridge.service.CloudinaryService;
import com.bookbridge.service.FileStorageService;
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
    private FileStorageService fileStorageService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private TutorialRepository tutorialRepository;

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
            String authHeader = request.getHeader("Authorization");
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            Map<String, Object> analytics = orderService.getUserOrderAnalytics(userOpt.get());
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching order analytics: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/tutorials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadTutorial(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam MultipartFile video,
            @RequestParam(required = false) MultipartFile thumbnail,
            HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String email = jwtUtil.extractUsername(authHeader.substring(7));
            User organization = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (organization.getUserType() != User.UserType.ORGANIZATION) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Only organizations can upload tutorials"));
            }

            // Validate price
            if (price == null || price.doubleValue() < 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid price"));
            }

            // Upload video to Cloudinary
            String videoPath = cloudinaryService.uploadVideo(video, "bookbridge/tutorial_videos");

            // Upload thumbnail to Cloudinary (if provided)
            String thumbnailPath = thumbnail != null
                    ? cloudinaryService.uploadImage(thumbnail, "bookbridge/tutorial_thumbnails")
                    : null;

            Tutorial tutorial = new Tutorial();
            tutorial.setTitle(title);
            tutorial.setDescription(description);
            tutorial.setPrice(price.doubleValue());
            tutorial.setVideoUrl(videoPath);
            tutorial.setThumbnailUrl(thumbnailPath);
            tutorial.setOrganization(organization);
            tutorial.setCreatedBy(organization.getId());

            tutorialRepository.save(tutorial);

            return ResponseEntity.ok(Map.of("message", "Tutorial uploaded successfully"));

        } catch (Exception e) {
            e.printStackTrace(); // <-- Log the real exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

}