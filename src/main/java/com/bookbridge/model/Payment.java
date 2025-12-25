package com.bookbridge.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", unique = true)
    private String paymentId;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "payment"})
    private Order order;

    @NotNull
    @DecimalMin(value = "0.0")
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    // eSewa specific fields
    @Column(name = "esewa_transaction_id")
    private String esewaTransactionId;

    @Column(name = "esewa_ref_id")
    private String esewaRefId;

    @Column(name = "merchant_code")
    private String merchantCode;

    @Column(name = "success_url")
    private String successUrl;

    @Column(name = "failure_url")
    private String failureUrl;

    @Column(name = "payment_response", length = 1000)
    private String paymentResponse;

    @Column(name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructors
    public Payment() {}

    public Payment(Order order, BigDecimal amount, PaymentMethod paymentMethod) {
        this.order = order;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentId = generatePaymentId();
    }

    // Helper method to generate payment ID
    private String generatePaymentId() {
        return "PAY" + System.currentTimeMillis();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getEsewaTransactionId() { return esewaTransactionId; }
    public void setEsewaTransactionId(String esewaTransactionId) { this.esewaTransactionId = esewaTransactionId; }

    public String getEsewaRefId() { return esewaRefId; }
    public void setEsewaRefId(String esewaRefId) { this.esewaRefId = esewaRefId; }

    public String getMerchantCode() { return merchantCode; }
    public void setMerchantCode(String merchantCode) { this.merchantCode = merchantCode; }

    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }

    public String getFailureUrl() { return failureUrl; }
    public void setFailureUrl(String failureUrl) { this.failureUrl = failureUrl; }

    public String getPaymentResponse() { return paymentResponse; }
    public void setPaymentResponse(String paymentResponse) { this.paymentResponse = paymentResponse; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    // Enums
    public enum PaymentMethod {
        CASH, BANK_TRANSFER, ESEWA, KHALTI, FONEPAY
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED
    }
}
