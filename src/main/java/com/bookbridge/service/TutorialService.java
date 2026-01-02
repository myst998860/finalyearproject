package com.bookbridge.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookbridge.enums.TutorialStatus;
import com.bookbridge.model.Tutorial;
import com.bookbridge.repository.TutorialRepository;

@Service
public class TutorialService {

    @Autowired
    private TutorialRepository tutorialRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Tutorial createTutorial(
            String title,
            String description,
            Double price,
            MultipartFile video,
            MultipartFile thumbnail,
            Long adminId
    ) throws IOException {

        Tutorial tutorial = new Tutorial();
        tutorial.setTitle(title);
        tutorial.setDescription(description);
        tutorial.setPrice(price);
        tutorial.setCreatedBy(adminId);

        // Save first to get ID
        tutorial = tutorialRepository.save(tutorial);

        // Upload video
        String videoUrl = cloudinaryService.uploadVideo(
                video,
                "bookbridge/tutorials/" + tutorial.getId() + "/video"
        );
        tutorial.setVideoUrl(videoUrl);

        // Upload thumbnail (optional)
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadTutorialThumbnail(
                    thumbnail,
                    tutorial.getId()
            );
            tutorial.setThumbnailUrl(thumbnailUrl);
        }

        return tutorialRepository.save(tutorial);
    }

    public List<Tutorial> getAllActiveTutorials() {
        return tutorialRepository.findByStatus(TutorialStatus.ACTIVE);
    }
    
    // === Add this ===
    public List<Tutorial> getAllTutorials() {
        return tutorialRepository.findAll(); // returns all tutorials
    }

    public Tutorial getById(Long id) {
        return tutorialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutorial not found"));
    }
}
