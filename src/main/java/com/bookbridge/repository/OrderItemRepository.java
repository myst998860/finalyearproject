package com.bookbridge.repository;

import com.bookbridge.model.OrderItem;
import com.bookbridge.model.Order;
import com.bookbridge.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrder(Order order);
    
    List<OrderItem> findByBook(Book book);
    
    // Use JPA method names instead of @Query for delete
    void deleteByOrder(Order order);
    
    void deleteByBook(Book book);
}
