package com.bookbridge.repository;

import com.bookbridge.model.Order;
import com.bookbridge.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);
    
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN ?1 AND ?2 ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN ?1 AND ?2 AND o.status = ?3 ORDER BY o.createdAt DESC")
    List<Order> findByDateRangeAndStatus(LocalDateTime startDate, LocalDateTime endDate, Order.OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN ?1 AND ?2")
    Long getCompletedOrdersCount(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING' AND o.createdAt BETWEEN ?1 AND ?2")
    Long getPendingOrdersCount(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'CANCELLED' AND o.createdAt BETWEEN ?1 AND ?2")
    Long getCancelledOrdersCount(LocalDateTime startDate, LocalDateTime endDate);
    
    // Use JPA method name instead of @Query for delete
    void deleteByUser(User user);
    
    // Add missing method for analytics
    @Query("SELECT COUNT(o) FROM Order o")
    Long countAllOrders();
    
    // Add missing method for business analytics
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt BETWEEN ?1 AND ?2 AND o.status = 'COMPLETED'")
    BigDecimal sumOrderAmountBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
    // Add missing methods that OrderService is trying to use
    @Query("SELECT o FROM Order o WHERE o.user = ?1")
    List<Order> findByUser(User user);
    
    @Query("SELECT o FROM Order o WHERE o.user = ?1")
    Page<Order> findUserOrdersPaged(User user, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.orderNumber = ?1")
    Optional<Order> findByOrderNumber(String orderNumber);
    
    @Query("SELECT o FROM Order o WHERE o.status = ?1")
    List<Order> findByStatus(Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.deliveryStatus = ?1")
    List<Order> findByDeliveryStatus(Order.DeliveryStatus deliveryStatus);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= ?1")
    Long countOrdersCreatedAfter(LocalDateTime date);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = ?1")
    Long countOrdersByStatus(Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(?1 IS NULL OR o.createdAt >= ?1) AND " +
           "(?2 IS NULL OR o.createdAt <= ?2) AND " +
           "(?3 IS NULL OR o.status = ?3) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersForReport(String startDate, String endDate, String status);
    
    @Query("SELECT new map(YEAR(o.createdAt) as year, MONTH(o.createdAt) as month, SUM(o.totalAmount) as revenue) " +
           "FROM Order o WHERE o.createdAt BETWEEN ?1 AND ?2 AND o.status = 'COMPLETED' " +
           "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) ORDER BY year, month")
    List<java.util.Map<String, Object>> getMonthlyRevenueBreakdown(LocalDateTime startDate, LocalDateTime endDate);
}
