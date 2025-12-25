package com.bookbridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "upwork_transactions")
public class UpworkTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Column(name = "project_name")
    private String projectName;

    @DecimalMin(value = "0.0")
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "upwork_reference")
    private String upworkReference;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructors
    public UpworkTransaction() {}

    public UpworkTransaction(String transactionId, String projectName, BigDecimal amount, String description) {
        this.transactionId = transactionId;
        this.projectName = projectName;
        this.amount = amount;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public String getUpworkReference() { return upworkReference; }
    public void setUpworkReference(String upworkReference) { this.upworkReference = upworkReference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    // Enums
    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
}
