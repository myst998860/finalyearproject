package com.bookbridge.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookbridge.enums.TutorialStatus;
import com.bookbridge.model.Tutorial;
import com.bookbridge.repository.TutorialRepository;

@RestController
@RequestMapping("/api/tutorials")
public class TutorialPublicController {

    @Autowired
    private TutorialRepository tutorialRepository;

    @GetMapping
    public List<Tutorial> getAllActiveTutorials() {
        return tutorialRepository.findByStatus(TutorialStatus.ACTIVE);
    }
}
