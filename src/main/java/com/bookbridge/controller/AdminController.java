package com.bookbridge.controller;

import com.bookbridge.model.*;
import com.bookbridge.service.*;
import com.bookbridge.repository.UserRepository;
import com.bookbridge.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private UpworkTransactionService upworkTransactionService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PDFService pdfService;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        // Hardcoded admin for testing
        if ("admin@bookbridge.com".equals(email) && "admin123".equals(password)) {
            // Generate JWT token for admin
            Map<String, Object> claims = new HashMap<>();
            claims.put("isAdmin", true);
            claims.put("adminId", 999L);
            String token = jwtUtil.generateToken(email, claims);
            
            // Also set session for backward compatibility
            HttpSession session = request.getSession();
            session.setAttribute("adminId", 999L);
            session.setAttribute("isAdmin", true);
            
            return ResponseEntity.ok(Map.of(
                "message", "Admin login successful",
                "token", token,
                "admin", Map.of(
                    "id", 999L,
                    "fullName", "Admin User",
                    "email", "admin@bookbridge.com"
                )
            ));
        }
        
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if user is admin
            if (user.getUserType() != User.UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied. Admin privileges required."));
            }
            
            // Verify password
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Generate JWT token
                Map<String, Object> claims = new HashMap<>();
                claims.put("isAdmin", true);
                claims.put("adminId", user.getId());
                String token = jwtUtil.generateToken(email, claims);
                
                // Also set session for backward compatibility
                HttpSession session = request.getSession();
                session.setAttribute("adminId", user.getId());
                session.setAttribute("isAdmin", true);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Admin login successful",
                    "token", token,
                    "admin", Map.of(
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail()
                    )
                ));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid admin credentials"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpServletRequest request) {
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
            LocalDateTime lastWeek = LocalDateTime.now().minusWeeks(1);
            
            Map<String, Object> stats = new HashMap<>();
            
            // User statistics
            List<User> allUsers = userService.getAllUsers();
            stats.put("totalUsers", allUsers.size());
            stats.put("newUsersThisMonth", userService.countUsersCreatedAfter(lastMonth));
            stats.put("activeUsers", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count());
            
            // Book statistics
            stats.put("totalBooks", bookService.countBooksByStatus(Book.BookStatus.AVAILABLE));
            stats.put("newBooksThisMonth", bookService.countBooksCreatedAfter(lastMonth));
            stats.put("soldBooks", bookService.countBooksByStatus(Book.BookStatus.SOLD));
            
            // Order statistics
            stats.put("totalOrders", orderService.countAllOrders());
            stats.put("newOrdersThisWeek", orderService.countOrdersCreatedAfter(lastWeek));
            stats.put("pendingOrders", orderService.countOrdersByStatus(Order.OrderStatus.PENDING));
            
            // Payment statistics
            stats.put("totalPayments", paymentService.countPaymentsByStatus(Payment.PaymentStatus.COMPLETED));
            stats.put("totalRevenue", paymentService.sumSuccessfulPaymentsBetweenDates(
                LocalDateTime.now().minusYears(1), LocalDateTime.now()));
            stats.put("revenueThisMonth", paymentService.sumSuccessfulPaymentsBetweenDates(lastMonth, LocalDateTime.now()));
            
            // Upwork transactions
            stats.put("upworkTransactions", upworkTransactionService.sumCompletedTransactions());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching dashboard stats: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching users: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            user.setStatus(User.UserStatus.BLOCKED);
            userService.updateUser(user);
            
            return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error blocking user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            user.setStatus(User.UserStatus.ACTIVE);
            userService.updateUser(user);
            
            return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error unblocking user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            userService.deleteUser(userId);
            
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting user: " + e.getMessage()));
        }
    }

    @GetMapping("/books")
    public ResponseEntity<?> getAllBooks(HttpServletRequest request) {
        try {
            List<Book> books = bookService.getAllBooks();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching books: " + e.getMessage()));
        }
    }

    @DeleteMapping("/books/{bookId}")
    public ResponseEntity<?> deleteBook(@PathVariable Long bookId, HttpServletRequest request) {
        try {
            Optional<Book> bookOptional = bookService.getBookById(bookId);
            if (bookOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            bookService.deleteBook(bookId);
            
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting book: " + e.getMessage()));
        }
    }

    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments(HttpServletRequest request) {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching payments: " + e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpServletRequest request) {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/orders")
    public ResponseEntity<?> getOrderAnalytics(HttpServletRequest request) {
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Order statistics
            analytics.put("totalOrders", orderService.countAllOrders());
            analytics.put("ordersThisMonth", orderService.countOrdersCreatedAfter(startOfMonth));
            analytics.put("ordersThisYear", orderService.countOrdersCreatedAfter(startOfYear));
            
            // Order status breakdown
            analytics.put("pendingOrders", orderService.countOrdersByStatus(Order.OrderStatus.PENDING));
            analytics.put("processingOrders", orderService.countOrdersByStatus(Order.OrderStatus.PROCESSING));
            analytics.put("shippedOrders", orderService.countOrdersByStatus(Order.OrderStatus.SHIPPED));
            analytics.put("deliveredOrders", orderService.countOrdersByStatus(Order.OrderStatus.DELIVERED));
            analytics.put("cancelledOrders", orderService.countOrdersByStatus(Order.OrderStatus.CANCELLED));
            
            // Revenue analytics
            analytics.put("totalRevenue", orderService.sumOrderAmountBetweenDates(startOfYear, now));
            analytics.put("monthlyRevenue", orderService.sumOrderAmountBetweenDates(startOfMonth, now));
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching order analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/payments")
    public ResponseEntity<?> getPaymentAnalytics(HttpServletRequest request) {
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Payment statistics
            analytics.put("totalPayments", paymentService.countAllPayments());
            analytics.put("paymentsThisMonth", paymentService.countPaymentsCreatedAfter(startOfMonth));
            analytics.put("paymentsThisYear", paymentService.countPaymentsCreatedAfter(startOfYear));
            
            // Payment status breakdown
            analytics.put("completedPayments", paymentService.countPaymentsByStatus(Payment.PaymentStatus.COMPLETED));
            analytics.put("pendingPayments", paymentService.countPaymentsByStatus(Payment.PaymentStatus.PENDING));
            analytics.put("failedPayments", paymentService.countPaymentsByStatus(Payment.PaymentStatus.FAILED));
            
            // Revenue analytics
            analytics.put("totalRevenue", paymentService.sumSuccessfulPaymentsBetweenDates(startOfYear, now));
            analytics.put("monthlyRevenue", paymentService.sumSuccessfulPaymentsBetweenDates(startOfMonth, now));
            
            // Payment method breakdown
            analytics.put("esewaPayments", paymentService.countPaymentsByMethod(Payment.PaymentMethod.ESEWA));
            analytics.put("cashPayments", paymentService.countPaymentsByMethod(Payment.PaymentMethod.CASH));
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching payment analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/business")
    public ResponseEntity<?> getBusinessAnalytics(HttpServletRequest request) {
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // User analytics
            List<User> allUsers = userService.getAllUsers();
            analytics.put("totalUsers", allUsers.size());
            analytics.put("newUsersThisMonth", userService.countUsersCreatedAfter(startOfMonth));
            analytics.put("activeUsers", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count());
            
            // Book analytics
            List<Book> allBooks = bookService.getAllBooks();
            analytics.put("totalBooks", allBooks.size());
            analytics.put("booksThisMonth", bookService.countBooksCreatedAfter(startOfMonth));
            analytics.put("availableBooks", bookService.countBooksByStatus(Book.BookStatus.AVAILABLE));
            analytics.put("soldBooks", bookService.countBooksByStatus(Book.BookStatus.SOLD));
            
            // Combined revenue (orders + upwork)
            Double orderRevenue = orderService.sumOrderAmountBetweenDates(startOfYear, now);
            Double upworkRevenue = upworkTransactionService.sumCompletedTransactions();
            
            analytics.put("totalRevenue", (orderRevenue != null ? orderRevenue : 0.0) + (upworkRevenue != null ? upworkRevenue : 0.0));
            analytics.put("orderRevenue", orderRevenue != null ? orderRevenue : 0.0);
            analytics.put("upworkRevenue", upworkRevenue != null ? upworkRevenue : 0.0);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching business analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/pdf")
    public ResponseEntity<?> downloadAnalyticsPDF(HttpServletRequest request) {
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            // Generate PDF
            byte[] pdfBytes = pdfService.generateAnalyticsReport();
            
            // Set headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bookbridge-analytics-report.pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating analytics PDF: " + e.getMessage()));
        }
    }

    @GetMapping("/reports/orders")
    public ResponseEntity<?> getOrderReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            List<Order> orders = orderService.getOrdersForReport(startDate, endDate, status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating order report: " + e.getMessage()));
        }
    }

    @GetMapping("/reports/payments")
    public ResponseEntity<?> getPaymentReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            List<Payment> payments = paymentService.getPaymentsForReport(startDate, endDate, status);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating payment report: " + e.getMessage()));
        }
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            Map<String, Object> report = new HashMap<>();
            
            // Parse dates if provided
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().withDayOfYear(1);
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();
            
            // Revenue breakdown
            report.put("orderRevenue", orderService.sumOrderAmountBetweenDates(start, end));
            report.put("paymentRevenue", paymentService.sumSuccessfulPaymentsBetweenDates(start, end));
            report.put("upworkRevenue", upworkTransactionService.sumCompletedTransactions());
            
            // Monthly breakdown
            report.put("monthlyBreakdown", orderService.getMonthlyRevenueBreakdown(start, end));
            
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating revenue report: " + e.getMessage()));
        }
    }

    @PostMapping("/upwork")
    public ResponseEntity<?> logUpworkTransaction(
            @RequestBody Map<String, Object> transactionRequest,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            String transactionId = transactionRequest.get("transactionId").toString();
            String projectName = transactionRequest.get("projectName") != null ? 
                transactionRequest.get("projectName").toString() : null;
            BigDecimal amount = transactionRequest.get("amount") != null ? 
                new BigDecimal(transactionRequest.get("amount").toString()) : null;
            String description = transactionRequest.get("description") != null ? 
                transactionRequest.get("description").toString() : null;
            
            UpworkTransaction transaction = upworkTransactionService.createTransaction(
                transactionId, projectName, amount, description);
            
            return ResponseEntity.ok(Map.of(
                "message", "Upwork transaction logged successfully",
                "transaction", transaction
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error logging Upwork transaction: " + e.getMessage()));
        }
    }

    @GetMapping("/upwork")
    public ResponseEntity<?> getUpworkTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UpworkTransaction> transactions = upworkTransactionService.getAllTransactionsPaged(pageable);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching Upwork transactions: " + e.getMessage()));
        }
    }

    @PutMapping("/upwork/{id}/status")
    public ResponseEntity<?> updateUpworkTransactionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin authentication required"));
        }
        
        try {
            String status = statusRequest.get("status");
            UpworkTransaction.TransactionStatus transactionStatus = 
                UpworkTransaction.TransactionStatus.valueOf(status.toUpperCase());
            
            UpworkTransaction transaction = upworkTransactionService.updateTransactionStatus(id, transactionStatus);
            
            return ResponseEntity.ok(Map.of(
                "message", "Transaction status updated successfully",
                "transaction", transaction
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating transaction status: " + e.getMessage()));
        }
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setupAdmin() {
        try {
            // Check if admin already exists
            Optional<User> existingAdmin = userService.getUserByEmail("admin@bookbridge.com");
            if (existingAdmin.isPresent()) {
                return ResponseEntity.ok(Map.of("message", "Admin user already exists"));
            }
            
            // Create admin user
            User adminUser = new User();
            adminUser.setFullName("Admin User");
            adminUser.setEmail("admin@bookbridge.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setUserType(User.UserType.ADMIN);
            adminUser.setStatus(User.UserStatus.ACTIVE);
            adminUser.setLocation("Kathmandu");
            adminUser.setPhone("9871234567");
            adminUser.setIsVerified(true);
            
            User savedAdmin = userRepository.save(adminUser);
            
            return ResponseEntity.ok(Map.of(
                "message", "Admin user created successfully",
                "admin", Map.of(
                    "id", savedAdmin.getId(),
                    "email", savedAdmin.getEmail(),
                    "fullName", savedAdmin.getFullName()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating admin user: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> adminLogout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            return ResponseEntity.ok(Map.of("message", "Admin logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error during logout: " + e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusRequest,
            HttpServletRequest request) {
        
        if (!isAdminAuthenticated(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Admin authentication required. Please login as admin."));
        }
        
        try {
            String status = statusRequest.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Status is required"));
            }
            
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            
            Order updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            
            return ResponseEntity.ok(Map.of(
                "message", "Order status updated successfully",
                "order", updatedOrder
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid order status: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating order status: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Admin server is running",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/test-session")
    public ResponseEntity<?> testSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object adminId = session.getAttribute("adminId");
            Object isAdmin = session.getAttribute("isAdmin");
            return ResponseEntity.ok(Map.of(
                "sessionId", session.getId(),
                "adminId", adminId,
                "isAdmin", isAdmin,
                "message", "Session is working"
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "message", "No session found"
            ));
        }
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAdminAuth(HttpServletRequest request) {
        // Remove authentication check for this endpoint so it can be used for debugging
        boolean isAuthenticated = isAdminAuthenticated(request);
        HttpSession session = request.getSession(false);
        
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", isAuthenticated);
        response.put("sessionExists", session != null);
        response.put("sessionId", session != null ? session.getId() : null);
        
        if (session != null) {
            response.put("isAdmin", session.getAttribute("isAdmin"));
            response.put("adminId", session.getAttribute("adminId"));
            response.put("allSessionAttributes", getSessionAttributes(session));
        }
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> getSessionAttributes(HttpSession session) {
        Map<String, Object> attributes = new HashMap<>();
        if (session != null) {
            java.util.Enumeration<String> attributeNames = session.getAttributeNames();
            while (attributeNames.hasMoreElements()) {
                String name = attributeNames.nextElement();
                attributes.put(name, session.getAttribute(name));
            }
        }
        return attributes;
    }

    private boolean isAdminAuthenticated(HttpServletRequest request) {
        // First check JWT token in Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractUsername(token);
                
                // Validate token and check if admin
                if (email != null && !jwtUtil.extractExpiration(token).before(new java.util.Date())) {
                    // Token is valid - check if it's admin token
                    // For hardcoded admin or any admin user
                    if ("admin@bookbridge.com".equals(email)) {
                        return true;
                    }
                    // Check if user exists and is admin
                    Optional<User> userOpt = userService.getUserByEmail(email);
                    if (userOpt.isPresent() && userOpt.get().getUserType() == User.UserType.ADMIN) {
                        return true;
                    }
                }
            } catch (Exception e) {
                System.out.println("JWT validation failed: " + e.getMessage());
            }
        }
        
        // Fallback to session-based auth
        HttpSession session = request.getSession(false);
        if (session != null) {
            Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
            Long adminId = (Long) session.getAttribute("adminId");
            if (isAdmin != null && isAdmin && adminId != null) {
                return true;
            }
        }
        
        return false;
    }
}
