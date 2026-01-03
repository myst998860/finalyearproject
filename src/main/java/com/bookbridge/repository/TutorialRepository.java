package com.bookbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookbridge.enums.TutorialStatus;
import com.bookbridge.model.Tutorial;
import com.bookbridge.model.User;

public interface TutorialRepository extends JpaRepository<Tutorial, Long> {

    List<Tutorial> findByStatus(TutorialStatus status);

    List<Tutorial> findByCreatedBy(Long adminId);

    long countByOrganization(User organization);
}
