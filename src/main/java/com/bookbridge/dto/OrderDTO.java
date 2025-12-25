package com.bookbridge.dto;

import com.bookbridge.model.Order;
import com.bookbridge.model.OrderItem;
import com.bookbridge.model.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String deliveryAddress;
    private String deliveryPhone;
    private String deliveryNotes;
    private LocalDateTime estimatedDelivery;
    private Order.DeliveryStatus deliveryStatus;
    private List<OrderItemDTO> orderItems;
    private PaymentDTO payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // Constructors
    public OrderDTO() {}

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.userId = order.getUser().getId();
        this.userEmail = order.getUser().getEmail();
        this.userFullName = order.getUser().getFullName();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.deliveryAddress = order.getDeliveryAddress();
        this.deliveryPhone = order.getDeliveryPhone();
        this.deliveryNotes = order.getDeliveryNotes();
        this.estimatedDelivery = order.getEstimatedDelivery();
        this.deliveryStatus = order.getDeliveryStatus();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
        this.completedAt = order.getCompletedAt();

        // Convert order items
        if (order.getOrderItems() != null) {
            this.orderItems = order.getOrderItems().stream()
                    .map(OrderItemDTO::new)
                    .collect(Collectors.toList());
        }

        // Convert payment
        if (order.getPayment() != null) {
            this.payment = new PaymentDTO(order.getPayment());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Order.OrderStatus getStatus() { return status; }
    public void setStatus(Order.OrderStatus status) { this.status = status; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getDeliveryPhone() { return deliveryPhone; }
    public void setDeliveryPhone(String deliveryPhone) { this.deliveryPhone = deliveryPhone; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public Order.DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(Order.DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public List<OrderItemDTO> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemDTO> orderItems) { this.orderItems = orderItems; }

    public PaymentDTO getPayment() { return payment; }
    public void setPayment(PaymentDTO payment) { this.payment = payment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    // Inner DTO classes
    public static class OrderItemDTO {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String bookImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;

        public OrderItemDTO() {}

        public OrderItemDTO(OrderItem orderItem) {
            this.id = orderItem.getId();
            this.bookId = orderItem.getBook().getId();
            this.bookTitle = orderItem.getBook().getTitle();
            this.bookAuthor = orderItem.getBook().getAuthor();
            this.bookImage = orderItem.getBook().getBookImage();
            this.quantity = orderItem.getQuantity();
            this.unitPrice = orderItem.getUnitPrice();
            this.totalPrice = orderItem.getTotalPrice();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }

        public String getBookTitle() { return bookTitle; }
        public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

        public String getBookAuthor() { return bookAuthor; }
        public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }

        public String getBookImage() { return bookImage; }
        public void setBookImage(String bookImage) { this.bookImage = bookImage; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    }

    public static class PaymentDTO {
        private Long id;
        private String paymentId;
        private BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        private Payment.PaymentStatus status;
        private String esewaTransactionId;
        private String esewaRefId;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;

        public PaymentDTO() {}

        public PaymentDTO(Payment payment) {
            this.id = payment.getId();
            this.paymentId = payment.getPaymentId();
            this.amount = payment.getAmount();
            this.paymentMethod = payment.getPaymentMethod();
            this.status = payment.getStatus();
            this.esewaTransactionId = payment.getEsewaTransactionId();
            this.esewaRefId = payment.getEsewaRefId();
            this.createdAt = payment.getCreatedAt();
            this.completedAt = payment.getCompletedAt();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

        public Payment.PaymentStatus getStatus() { return status; }
        public void setStatus(Payment.PaymentStatus status) { this.status = status; }

        public String getEsewaTransactionId() { return esewaTransactionId; }
        public void setEsewaTransactionId(String esewaTransactionId) { this.esewaTransactionId = esewaTransactionId; }

        public String getEsewaRefId() { return esewaRefId; }
        public void setEsewaRefId(String esewaRefId) { this.esewaRefId = esewaRefId; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }
} 