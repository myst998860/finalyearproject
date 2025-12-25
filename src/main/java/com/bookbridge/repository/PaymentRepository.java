package com.bookbridge.repository;

import com.bookbridge.model.Payment;
import com.bookbridge.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByOrder(Order order);
    
    List<Payment> findByStatusOrderByCreatedAtDesc(Payment.PaymentStatus status);
    
    Page<Payment> findByStatusOrderByCreatedAtDesc(Payment.PaymentStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN ?1 AND ?2 ORDER BY p.createdAt DESC")
    List<Payment> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN ?1 AND ?2 AND p.status = ?3 ORDER BY p.createdAt DESC")
    List<Payment> findByDateRangeAndStatus(LocalDateTime startDate, LocalDateTime endDate, Payment.PaymentStatus status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt BETWEEN ?1 AND ?2")
    Double getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED' AND p.createdAt BETWEEN ?1 AND ?2")
    Long getCompletedPaymentsCount(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt BETWEEN ?1 AND ?2")
    Long getPendingPaymentsCount(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'FAILED' AND p.createdAt BETWEEN ?1 AND ?2")
    Long getFailedPaymentsCount(LocalDateTime startDate, LocalDateTime endDate);
    
    // Use JPA method name instead of @Query for delete
    void deleteByOrder(Order order);
    
    // Add missing method for analytics
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.createdAt >= ?1")
    Long countPaymentsCreatedAfter(LocalDateTime date);
}
