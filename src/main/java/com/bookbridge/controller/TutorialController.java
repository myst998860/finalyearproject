package com.bookbridge.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookbridge.enums.TutorialStatus;
import com.bookbridge.model.Tutorial;
import com.bookbridge.model.TutorialPurchase;
import com.bookbridge.model.User;
import com.bookbridge.repository.TutorialRepository;
import com.bookbridge.service.TutorialService;
import com.bookbridge.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/tutorials")
public class TutorialController {

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private TutorialRepository tutorialRepository;

    @Autowired
    private UserService userService;

    // ===== CREATE =====

    // ===== GET ALL ACTIVE TUTORIALS (for user) =====
    @GetMapping({ "", "/active" })
    public ResponseEntity<List<Tutorial>> getAllActiveTutorials() {
        return ResponseEntity.ok(tutorialRepository.findByStatus(TutorialStatus.ACTIVE));
    }

    // ===== GET ALL TUTORIALS (for org/admin) =====
    @GetMapping("/all")
    public ResponseEntity<List<Tutorial>> getAllTutorials() {
        return ResponseEntity.ok(tutorialService.getAllTutorials());
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public ResponseEntity<Tutorial> getTutorial(@PathVariable Long id) {
        return ResponseEntity.ok(tutorialService.getById(id));
    }

    // ===== PURCHASE CHECK =====
    @GetMapping("/purchased")
    public ResponseEntity<?> getPurchasedTutorials() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        List<Long> purchasedIds = tutorialService.getPurchasesByUser(user).stream()
                .map(p -> p.getTutorial().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(purchasedIds);
    }

    // ===== RECORD PURCHASE =====
    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseTutorial(@RequestParam Long tutorialId, @RequestParam String transactionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        try {
            TutorialPurchase purchase = tutorialService.recordPurchase(user, tutorialId, transactionId);
            return ResponseEntity.ok(purchase);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Purchase failed: " + e.getMessage()));
        }
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userService.getUserByEmail(email).orElse(null);
        }
        return null;
    }
}
