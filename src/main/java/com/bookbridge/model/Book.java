package com.bookbridge.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 200)
    private String title;

    @NotBlank
    @Column(length = 100)
    private String author;

    private String edition;

    @Column(length = 20)
    private String isbn;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BookCategory category;

    @Column(name = "`condition`")
    @NotNull
    @Enumerated(EnumType.STRING)
    private BookCondition condition;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type")
    private ListingType listingType;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Column(length = 1000)
    private String description;

    @NotBlank
    private String location;

    @Column(name = "book_image")
    private String bookImage;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BookStatus status = BookStatus.AVAILABLE;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "interest_count")
    private Integer interestCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "book"})
    private List<CartItem> cartItems;

    // Constructors
    public Book() {}

    public Book(String title, String author, BookCategory category, BookCondition condition, 
                ListingType listingType, String location, User user) {
        this.title = title;
        this.author = author;
        this.category = category;
        this.condition = condition;
        this.listingType = listingType;
        this.location = location;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getEdition() { return edition; }
    public void setEdition(String edition) { this.edition = edition; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public BookCategory getCategory() { return category; }
    public void setCategory(BookCategory category) { this.category = category; }

    public BookCondition getCondition() { return condition; }
    public void setCondition(BookCondition condition) { this.condition = condition; }

    public ListingType getListingType() { return listingType; }
    public void setListingType(ListingType listingType) { this.listingType = listingType; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBookImage() { return bookImage; }
    public void setBookImage(String bookImage) { this.bookImage = bookImage; }

    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getInterestCount() { return interestCount; }
    public void setInterestCount(Integer interestCount) { this.interestCount = interestCount; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<CartItem> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }

    // Helper method to increment view count
    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null) ? 1 : this.viewCount + 1;
    }

    // Helper method to increment interest count
    public void incrementInterestCount() {
        this.interestCount = (this.interestCount == null) ? 1 : this.interestCount + 1;
    }

    // Enums
    public enum BookCategory {
        SCIENCE, LITERATURE, ENGINEERING, MATHEMATICS, HISTORY, 
        PHILOSOPHY, ARTS, BUSINESS, TECHNOLOGY, MEDICAL, 
        LAW, EDUCATION, FICTION, NON_FICTION, TEXTBOOK, OTHER
    }

    public enum BookCondition {
        EXCELLENT, NEW, GOOD, FAIR, POOR
    }

    public enum ListingType {
        SELL, RENT, EXCHANGE, DONATE
    }

    public enum BookStatus {
        AVAILABLE, RESERVED, SOLD, EXCHANGED, DONATED, DELETED
    }
}
