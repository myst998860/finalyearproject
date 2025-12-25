package com.bookbridge.repository;

import com.bookbridge.model.CartItem;
import com.bookbridge.model.User;
import com.bookbridge.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<CartItem> findByUserAndBook(User user, Book book);
    
    List<CartItem> findByBook(Book book);
    
    // Use JPA method names instead of @Query for delete
    void deleteByUser(User user);
    
    void deleteByUserAndBook(User user, Book book);
    
    void deleteByBook(Book book);
    
    // Add missing methods that CartService is trying to use
    @Query("SELECT ci FROM CartItem ci WHERE ci.user = ?1")
    List<CartItem> findByUser(User user);
    
    @Query("SELECT COALESCE(SUM(ci.book.price * ci.quantity), 0.0) FROM CartItem ci WHERE ci.user = ?1")
    Double calculateCartTotal(User user);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.user = ?1")
    Long countCartItemsByUser(User user);
}
