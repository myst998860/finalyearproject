package com.bookbridge.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookbridge.enums.TutorialStatus;
import com.bookbridge.model.Tutorial;
import com.bookbridge.model.TutorialPurchase;
import com.bookbridge.model.User;
import com.bookbridge.repository.TutorialPurchaseRepository;
import com.bookbridge.repository.TutorialRepository;

@Service
public class TutorialService {

    @Autowired
    private TutorialRepository tutorialRepository;

    @Autowired
    private TutorialPurchaseRepository tutorialPurchaseRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Tutorial createTutorial(
            String title,
            String description,
            Double price,
            MultipartFile video,
            MultipartFile thumbnail,
            Long adminId) throws IOException {

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
                "bookbridge/tutorials/" + tutorial.getId() + "/video");
        tutorial.setVideoUrl(videoUrl);

        // Upload thumbnail (optional)
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadTutorialThumbnail(
                    thumbnail,
                    tutorial.getId());
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

    public boolean isPurchased(User user, Tutorial tutorial) {
        return tutorialPurchaseRepository.existsByUserAndTutorial(user, tutorial);
    }

    public List<TutorialPurchase> getPurchasesByUser(User user) {
        return tutorialPurchaseRepository.findByUser(user);
    }

    public TutorialPurchase recordPurchase(User user, Long tutorialId, String transactionId) {
        Tutorial tutorial = getById(tutorialId);

        // Check if already purchased
        if (isPurchased(user, tutorial)) {
            return tutorialPurchaseRepository.findByUserAndTutorial(user, tutorial).get();
        }

        TutorialPurchase purchase = new TutorialPurchase();
        purchase.setUser(user);
        purchase.setTutorial(tutorial);
        purchase.setTransactionId(transactionId);

        return tutorialPurchaseRepository.save(purchase);
    }
}
