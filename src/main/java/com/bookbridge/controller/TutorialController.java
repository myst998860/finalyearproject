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
import com.bookbridge.repository.TutorialRepository;
import com.bookbridge.service.TutorialService;

@RestController
@RequestMapping("/api/organization/tutorials")
public class TutorialController {

    @Autowired
    private TutorialService tutorialService;
    
    @Autowired
    private TutorialRepository tutorialRepository;

    // ===== CREATE =====


    // ===== GET ALL ACTIVE TUTORIALS (for user) =====
    @GetMapping("/active")
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
}
