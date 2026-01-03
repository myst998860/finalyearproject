package com.bookbridge.repository;

import com.bookbridge.model.Order;
import com.bookbridge.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

       @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
       List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.status = :status ORDER BY o.createdAt DESC")
       List<Order> findByDateRangeAndStatus(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate, @Param("status") Order.OrderStatus status);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
       Long getCompletedOrdersCount(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING' AND o.createdAt BETWEEN :startDate AND :endDate")
       Long getPendingOrdersCount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'CANCELLED' AND o.createdAt BETWEEN :startDate AND :endDate")
       Long getCancelledOrdersCount(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       void deleteByUser(User user);

       @Query("SELECT COUNT(o) FROM Order o")
       Long countAllOrders();

       @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.status = 'COMPLETED'")
       BigDecimal sumOrderAmountBetweenDates(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("SELECT o FROM Order o WHERE o.user = :user")
       List<Order> findByUser(@Param("user") User user);

       @Query("SELECT o FROM Order o WHERE o.user = :user")
       Page<Order> findUserOrdersPaged(@Param("user") User user, Pageable pageable);

       @Query("SELECT o FROM Order o WHERE o.orderNumber = :orderNumber")
       Optional<Order> findByOrderNumber(@Param("orderNumber") String orderNumber);

       @Query("SELECT o FROM Order o WHERE o.status = :status")
       List<Order> findByStatus(@Param("status") Order.OrderStatus status);

       @Query("SELECT o FROM Order o WHERE o.deliveryStatus = :deliveryStatus")
       List<Order> findByDeliveryStatus(@Param("deliveryStatus") Order.DeliveryStatus deliveryStatus);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :date")
       Long countOrdersCreatedAfter(@Param("date") LocalDateTime date);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
       Long countOrdersByStatus(@Param("status") Order.OrderStatus status);

       @Query("SELECT o FROM Order o WHERE " +
                     "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
                     "(:endDate IS NULL OR o.createdAt <= :endDate) AND " +
                     "(:status IS NULL OR o.status = :status) " +
                     "ORDER BY o.createdAt DESC")
       List<Order> findOrdersForReport(@Param("startDate") String startDate, @Param("endDate") String endDate,
                     @Param("status") String status);

       @Query("SELECT new map(YEAR(o.createdAt) as year, MONTH(o.createdAt) as month, SUM(o.totalAmount) as revenue) " +
                     "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.status = 'COMPLETED' " +
                     "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) ORDER BY year, month")
       List<java.util.Map<String, Object>> getMonthlyRevenueBreakdown(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user")
       Long countByUser(@Param("user") User user);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.createdAt >= :date")
       Long countByUserAndCreatedAtAfter(@Param("user") User user, @Param("date") LocalDateTime date);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.status = :status")
       Long countByUserAndStatus(@Param("user") User user, @Param("status") Order.OrderStatus status);

       @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user = :user AND o.createdAt BETWEEN :startDate AND :endDate")
       BigDecimal sumTotalAmountByUserAndCreatedAtBetween(@Param("user") User user,
                     @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
