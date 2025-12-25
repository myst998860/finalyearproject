package com.bookbridge.repository;

import com.bookbridge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByResetToken(String resetToken);
    
    @Query("SELECT u FROM User u WHERE u.resetTokenExpiry < ?1")
    List<User> findAllWithExpiredResetToken(LocalDateTime now);
    
    List<User> findByUserType(User.UserType userType);
    
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' AND u.userType = ?1")
    List<User> findActiveUsersByType(User.UserType userType);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= ?1")
    Long countUsersCreatedAfter(LocalDateTime date);
}
