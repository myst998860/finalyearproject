package com.bookbridge.repository;

import com.bookbridge.model.Notification;
import com.bookbridge.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = ?1 AND n.isRead = false")
    Long countUnreadNotificationsByUser(User user);
    
    @Query("SELECT n FROM Notification n WHERE n.user = ?1 AND n.type = ?2 ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, Notification.NotificationType type);
    
    @Query("SELECT n FROM Notification n WHERE n.user = ?1 AND n.book = ?2 ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndBookOrderByCreatedAtDesc(User user, Long bookId);
    
    // Use JPA method name instead of @Query for delete
    void deleteByUser(User user);
} 