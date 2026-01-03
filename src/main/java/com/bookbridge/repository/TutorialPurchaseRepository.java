package com.bookbridge.repository;

import com.bookbridge.model.Tutorial;
import com.bookbridge.model.TutorialPurchase;
import com.bookbridge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorialPurchaseRepository extends JpaRepository<TutorialPurchase, Long> {
    List<TutorialPurchase> findByUser(User user);

    Optional<TutorialPurchase> findByUserAndTutorial(User user, Tutorial tutorial);

    boolean existsByUserAndTutorial(User user, Tutorial tutorial);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM TutorialPurchase p JOIN p.tutorial t WHERE t.organization = :organization")
    long countByTutorialOrganization(
            @org.springframework.data.repository.query.Param("organization") User organization);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.price) FROM TutorialPurchase p JOIN p.tutorial t")
    Double sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.price) FROM TutorialPurchase p JOIN p.tutorial t WHERE t.organization = :organization")
    Double sumRevenueByOrganization(@org.springframework.data.repository.query.Param("organization") User organization);
}
