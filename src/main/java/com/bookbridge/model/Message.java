package com.bookbridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @NotBlank
    @Column(length = 1000)
    private String content;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Constructors
    public Message() {}

    public Message(User sender, User receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
    }

    public Message(User sender, User receiver, String content, Book book) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.book = book;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { 
        this.isRead = isRead;
        if (isRead && this.readAt == null) {
            this.readAt = LocalDateTime.now();
        }
    }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    // Enums
    public enum MessageType {
        TEXT, IMAGE, SYSTEM
    }
}
