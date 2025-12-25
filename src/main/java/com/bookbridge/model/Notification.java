package com.bookbridge.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @NotNull
    @Column(length = 200)
    private String title;

    @NotNull
    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private NotificationType type = NotificationType.ORDER;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Order order;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Constructors
    public Notification() {}

    public Notification(User user, String title, String message, NotificationType type) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
    }

    public Notification(User user, String title, String message, NotificationType type, Book book, Order order) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.book = book;
        this.order = order;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    // Helper method to mark as read
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    // Enums
    public enum NotificationType {
        ORDER, PAYMENT, DELIVERY, SYSTEM, BOOK_STATUS
    }
} 