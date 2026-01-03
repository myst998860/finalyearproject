package com.bookbridge.repository;

import com.bookbridge.model.OrderItem;
import com.bookbridge.model.Order;
import com.bookbridge.model.Book;
import com.bookbridge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByBook(Book book);

    @Query("SELECT COUNT(DISTINCT oi.order.user) FROM OrderItem oi WHERE oi.book.user = :user")
    Long countUniqueBuyersByOrganization(@Param("user") User user);

    @Query("SELECT COUNT(DISTINCT oi.order) FROM OrderItem oi WHERE oi.book.user = :user")
    Long countOrdersByOrganization(@Param("user") User user);

    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.book.user = :user")
    BigDecimal sumRevenueByOrganization(@Param("user") User user);

    @Query("SELECT COUNT(DISTINCT oi.order) FROM OrderItem oi WHERE oi.book.user = :user AND oi.order.createdAt >= :date")
    Long countOrdersByOrganizationAfterDate(@Param("user") User user, @Param("date") LocalDateTime date);

    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.book.user = :user AND oi.order.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueByOrganizationBetweenDates(@Param("user") User user, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT DISTINCT oi.order FROM OrderItem oi WHERE oi.book.user = :user")
    List<Order> findOrdersByOrganization(@Param("user") User user);

    @Query("SELECT COUNT(DISTINCT oi.order) FROM OrderItem oi WHERE oi.book.user = :user AND oi.order.status = :status")
    Long countOrdersByOrganizationAndStatus(@Param("user") User user, @Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi")
    BigDecimal sumTotalRevenue();

    // Use JPA method names instead of @Query for delete
    void deleteByOrder(Order order);

    void deleteByBook(Book book);
}
