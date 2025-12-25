package com.bookbridge.repository;

import com.bookbridge.model.Book;
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
public interface BookRepository extends JpaRepository<Book, Long> {
    
    List<Book> findByUserOrderByCreatedAtDesc(User user);
    
    Page<Book> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Book> findByCategoryOrderByCreatedAtDesc(Book.BookCategory category);
    
    Page<Book> findByCategoryOrderByCreatedAtDesc(Book.BookCategory category, Pageable pageable);
    
    List<Book> findByConditionOrderByCreatedAtDesc(Book.BookCondition condition);
    
    Page<Book> findByConditionOrderByCreatedAtDesc(Book.BookCondition condition, Pageable pageable);
    
    List<Book> findByStatusOrderByCreatedAtDesc(Book.BookStatus status);
    
    Page<Book> findByStatusOrderByCreatedAtDesc(Book.BookStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %?1% OR b.author LIKE %?1% OR b.description LIKE %?1% ORDER BY b.createdAt DESC")
    List<Book> searchBooks(String searchTerm);
    
    @Query("SELECT b FROM Book b WHERE b.title LIKE %?1% OR b.author LIKE %?1% OR b.description LIKE %?1% ORDER BY b.createdAt DESC")
    Page<Book> searchBooks(String searchTerm, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.price BETWEEN ?1 AND ?2 ORDER BY b.createdAt DESC")
    List<Book> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    
    @Query("SELECT b FROM Book b WHERE b.price BETWEEN ?1 AND ?2 ORDER BY b.createdAt DESC")
    Page<Book> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.category = ?1")
    Long countBooksByCategory(Book.BookCategory category);
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.condition = ?1")
    Long countBooksByCondition(Book.BookCondition condition);
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = ?1")
    Long countBooksByStatus(Book.BookStatus status);
    
    // Use JPA method name instead of @Query for delete
    void deleteByUser(User user);
    
    // Add missing method for analytics
    @Query("SELECT COUNT(b) FROM Book b WHERE b.createdAt >= ?1")
    Long countBooksCreatedAfter(LocalDateTime date);
    
    // Add missing methods that BookService is trying to use
    @Query("SELECT b FROM Book b WHERE b.status = 'AVAILABLE' ORDER BY b.createdAt DESC")
    Page<Book> findAvailableBooks(Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.id = ?1 AND b.status != 'DELETED'")
    Optional<Book> findByIdAndNotDeleted(Long id);
    
    @Query("SELECT b FROM Book b WHERE b.user = ?1")
    List<Book> findByUser(User user);
    
    @Query("SELECT b FROM Book b WHERE b.user = ?1")
    List<Book> findAllByUser(User user);
    
    @Query("SELECT b FROM Book b WHERE b.listingType = ?1 ORDER BY b.createdAt DESC")
    Page<Book> findByListingType(Book.ListingType listingType, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.location LIKE %?1% ORDER BY b.createdAt DESC")
    Page<Book> findByLocation(String location, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.category = ?1 ORDER BY b.createdAt DESC")
    Page<Book> findByCategory(Book.BookCategory category, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.condition = ?1 ORDER BY b.createdAt DESC")
    Page<Book> findByCondition(Book.BookCondition condition, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE " +
           "(?1 IS NULL OR (b.title LIKE %?1% OR b.author LIKE %?1% OR b.description LIKE %?1%)) AND " +
           "(?2 IS NULL OR b.category = ?2) AND " +
           "(?3 IS NULL OR b.condition = ?3) AND " +
           "(?4 IS NULL OR b.listingType = ?4) AND " +
           "(?5 IS NULL OR b.location LIKE %?5%) " +
           "ORDER BY b.createdAt DESC")
    Page<Book> searchBooksWithFilters(String keyword, Book.BookCategory category, 
                                     Book.BookCondition condition, Book.ListingType listingType, 
                                     String location, Pageable pageable);
}
