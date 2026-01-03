package com.bookbridge.service;

import com.bookbridge.model.*;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.CartItemRepository;
import com.bookbridge.repository.OrderItemRepository;
import com.bookbridge.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            BookRepository bookRepository,
            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.notificationService = notificationService;
    }

    public Long countOrdersByOrganization(Long organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        User organization = new User();
        organization.setId(organizationId);
        return orderItemRepository.countOrdersByOrganization(organization);
    }

    public Long countOrdersByOrganizationAfterDate(Long organizationId, LocalDateTime date) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        User organization = new User();
        organization.setId(organizationId);
        return orderItemRepository.countOrdersByOrganizationAfterDate(organization, date);
    }

    public List<Order> getOrdersByOrganization(Long organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        User organization = new User();
        organization.setId(organizationId);
        return orderItemRepository.findOrdersByOrganization(organization);
    }

    public List<Order> getOrdersByOrganizationAfterDate(Long organizationId, LocalDateTime date) {
        // For now, let's just use the basic one or filter if needed.
        // If we need a specific date range, we can add it to the repository.
        return getOrdersByOrganization(organizationId).stream()
                .filter(o -> !o.getCreatedAt().isBefore(date))
                .collect(Collectors.toList());
    }

    public List<Order> getAllOrders() {
        try {
            return orderRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve all orders", e);
        }
    }

    public Optional<Order> getOrderById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        try {
            return orderRepository.findById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve order with ID: " + id, e);
        }
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Order number cannot be null or empty");
        }
        try {
            return orderRepository.findByOrderNumber(orderNumber);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve order with number: " + orderNumber, e);
        }
    }

    public List<Order> getOrdersByUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            return orderRepository.findByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve orders for user: " + user.getId(), e);
        }
    }

    public Page<Order> getUserOrdersPaged(User user, Pageable pageable) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        try {
            return orderRepository.findUserOrdersPaged(user, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve paged orders for user: " + user.getId(), e);
        }
    }

    @Transactional
    public Order createOrderFromCart(User user, String deliveryAddress, String deliveryPhone, String deliveryNotes) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
            throw new IllegalArgumentException("Delivery address cannot be null or empty");
        }

        try {
            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            if (cartItems.isEmpty()) {
                throw new IllegalStateException("Cart is empty");
            }

            // Calculate total amount
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                if (item.getBook().getListingType() == Book.ListingType.SELL && item.getBook().getPrice() != null) {
                    totalAmount = totalAmount
                            .add(item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }

            // Create order
            Order order = new Order(user, totalAmount, deliveryAddress);
            order.setDeliveryPhone(deliveryPhone);
            order.setDeliveryNotes(deliveryNotes);
            order.setEstimatedDelivery(LocalDateTime.now().plusDays(7)); // Default 7 days delivery estimate
            Order savedOrder = orderRepository.save(order);

            // Create order items and notify sellers
            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItem cartItem : cartItems) {
                Book book = cartItem.getBook();

                // Update book status to RESERVED
                book.setStatus(Book.BookStatus.RESERVED);
                bookRepository.save(book);

                // Create order item
                BigDecimal unitPrice = (book.getListingType() == Book.ListingType.SELL && book.getPrice() != null)
                        ? book.getPrice()
                        : BigDecimal.ZERO;
                OrderItem orderItem = new OrderItem(savedOrder, book, cartItem.getQuantity(), unitPrice);
                orderItems.add(orderItemRepository.save(orderItem));

                // Notify the seller that their book has been ordered
                notificationService.notifySellerBookOrdered(book, savedOrder, user);
            }

            // Clear the cart
            cartItemRepository.deleteByUser(user);

            return savedOrder;
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create order from cart", e);
        }
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Order status cannot be null");
        }

        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setStatus(status);

                // Update book statuses based on order status
                if (status == Order.OrderStatus.CANCELLED) {
                    for (OrderItem item : order.getOrderItems()) {
                        Book book = item.getBook();
                        book.setStatus(Book.BookStatus.AVAILABLE);
                        bookRepository.save(book);
                    }
                } else if (status == Order.OrderStatus.DELIVERED) {
                    for (OrderItem item : order.getOrderItems()) {
                        Book book = item.getBook();
                        book.setStatus(Book.BookStatus.SOLD);
                        bookRepository.save(book);
                    }
                }

                return orderRepository.save(order);
            }
            throw new IllegalArgumentException("Order not found with ID: " + orderId);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update order status", e);
        }
    }

    @Transactional
    public Order updateDeliveryStatus(Long orderId, Order.DeliveryStatus status) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Delivery status cannot be null");
        }

        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setDeliveryStatus(status);
                return orderRepository.save(order);
            }
            throw new IllegalArgumentException("Order not found with ID: " + orderId);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update delivery status", e);
        }
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        if (orderId == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }

        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setStatus(Order.OrderStatus.CANCELLED);

                // Return books to available status
                for (OrderItem item : order.getOrderItems()) {
                    Book book = item.getBook();
                    book.setStatus(Book.BookStatus.AVAILABLE);
                    bookRepository.save(book);
                }

                orderRepository.save(order);
            } else {
                throw new IllegalArgumentException("Order not found with ID: " + orderId);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel order", e);
        }
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Order status cannot be null");
        }
        try {
            return orderRepository.findByStatus(status);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve orders by status: " + status, e);
        }
    }

    public List<Order> getOrdersByDeliveryStatus(Order.DeliveryStatus deliveryStatus) {
        if (deliveryStatus == null) {
            throw new IllegalArgumentException("Delivery status cannot be null");
        }
        try {
            return orderRepository.findByDeliveryStatus(deliveryStatus);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve orders by delivery status: " + deliveryStatus, e);
        }
    }

    public Long countOrdersCreatedAfter(LocalDateTime date) {
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        try {
            return orderRepository.countOrdersCreatedAfter(date);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count orders created after: " + date, e);
        }
    }

    public Long countOrdersByStatus(Order.OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Order status cannot be null");
        }
        try {
            return orderRepository.countOrdersByStatus(status);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count orders by status: " + status, e);
        }
    }

    public Long countAllOrders() {
        try {
            return orderRepository.count();
        } catch (Exception e) {
            throw new RuntimeException("Failed to count all orders", e);
        }
    }

    public Double sumOrderAmountBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date cannot be null");
        }
        if (endDate == null) {
            throw new IllegalArgumentException("End date cannot be null");
        }
        try {
            BigDecimal sum = orderRepository.sumOrderAmountBetweenDates(startDate, endDate);
            return sum != null ? sum.doubleValue() : 0.0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to sum order amounts between dates", e);
        }
    }

    public List<Order> getOrdersForReport(String startDate, String endDate, String status) {
        try {
            return orderRepository.findOrdersForReport(startDate, endDate, status);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve orders for report", e);
        }
    }

    public List<Map<String, Object>> getMonthlyRevenueBreakdown(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date cannot be null");
        }
        if (endDate == null) {
            throw new IllegalArgumentException("End date cannot be null");
        }
        try {
            return orderRepository.getMonthlyRevenueBreakdown(startDate, endDate);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get monthly revenue breakdown", e);
        }
    }

    public Map<String, Object> getUserOrderAnalytics(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);

            Map<String, Object> analytics = new HashMap<>();

            // Basic statistics
            analytics.put("totalOrders", orderRepository.countByUser(user));
            analytics.put("ordersThisMonth", orderRepository.countByUserAndCreatedAtAfter(user, startOfMonth));
            analytics.put("ordersThisYear", orderRepository.countByUserAndCreatedAtAfter(user, startOfYear));

            // Status breakdown
            analytics.put("pendingOrders", orderRepository.countByUserAndStatus(user, Order.OrderStatus.PENDING));
            analytics.put("processingOrders", orderRepository.countByUserAndStatus(user, Order.OrderStatus.PROCESSING));
            analytics.put("shippedOrders", orderRepository.countByUserAndStatus(user, Order.OrderStatus.SHIPPED));
            analytics.put("deliveredOrders", orderRepository.countByUserAndStatus(user, Order.OrderStatus.DELIVERED));
            analytics.put("cancelledOrders", orderRepository.countByUserAndStatus(user, Order.OrderStatus.CANCELLED));

            // Expenditure analytics
            BigDecimal totalSpent = orderRepository.sumTotalAmountByUserAndCreatedAtBetween(user,
                    startOfYear.minusYears(10), now);
            BigDecimal spentThisMonth = orderRepository.sumTotalAmountByUserAndCreatedAtBetween(user, startOfMonth,
                    now);

            analytics.put("totalExpenditure", totalSpent != null ? totalSpent.doubleValue() : 0.0);
            analytics.put("monthlyExpenditure", spentThisMonth != null ? spentThisMonth.doubleValue() : 0.0);

            return analytics;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user order analytics", e);
        }
    }

    public Map<String, Object> getOrganizationDashboardStats(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

            Map<String, Object> stats = new HashMap<>();

            // 1. Total Books (listed by organization and not deleted)
            Long totalBooks = bookRepository.countByUserAndStatusNot(user, Book.BookStatus.DELETED);
            stats.put("totalBooks", totalBooks != null ? totalBooks : 0L);

            // 2. Total Users (unique buyers who bought from this organization)
            Long totalUsers = orderItemRepository.countUniqueBuyersByOrganization(user);
            stats.put("totalUsers", totalUsers != null ? totalUsers : 0L);

            // 3. Pending Orders (for this organization's books)
            Long pendingOrders = orderItemRepository.countOrdersByOrganizationAndStatus(user,
                    Order.OrderStatus.PENDING);
            stats.put("pendingOrders", pendingOrders != null ? pendingOrders : 0L);

            // 4. Total Orders (at least one book from this organization)
            Long totalOrders = orderItemRepository.countOrdersByOrganization(user);
            stats.put("totalOrders", totalOrders != null ? totalOrders : 0L);

            // 5. Total Revenue (from all sales by this organization)
            BigDecimal totalRevenue = orderItemRepository.sumRevenueByOrganization(user);
            stats.put("totalRevenue", totalRevenue != null ? totalRevenue.doubleValue() : 0.0);

            // 6. Growth stats (optional but good for dashboard)
            Long newOrdersThisMonth = orderItemRepository.countOrdersByOrganizationAfterDate(user, startOfMonth);
            stats.put("newOrdersThisMonth", newOrdersThisMonth != null ? newOrdersThisMonth : 0L);

            return stats;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch organization dashboard stats", e);
        }
    }

    public BigDecimal sumTotalRevenue() {
        try {
            return orderItemRepository.sumTotalRevenue();
        } catch (Exception e) {
            throw new RuntimeException("Failed to sum total revenue", e);
        }
    }
}
