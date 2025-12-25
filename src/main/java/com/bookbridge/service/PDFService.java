package com.bookbridge.service;

import com.bookbridge.model.Order;
import com.bookbridge.model.OrderItem;
import com.bookbridge.model.Book;
import com.bookbridge.model.User;
import com.bookbridge.model.Payment;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class PDFService {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PaymentService paymentService;

    public byte[] generateOrderInvoice(Order order) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Add header
        addHeader(document, order);
        
        // Add order details
        addOrderDetails(document, order);
        
        // Add items table
        addItemsTable(document, order.getOrderItems());
        
        // Add total
        addTotal(document, order);
        
        // Add footer
        addFooter(document);
        
        document.close();
        return baos.toByteArray();
    }

    public byte[] generateAnalyticsReport() throws Exception {
        Document document = new Document(PageSize.A4.rotate()); // Landscape for better chart display
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Add title page
        addAnalyticsTitlePage(document);
        
        // Add executive summary
        addExecutiveSummary(document);
        
        // Add detailed analytics sections
        addOrderAnalytics(document);
        addBookAnalytics(document);
        addUserAnalytics(document);
        addPaymentAnalytics(document);
        addRevenueAnalytics(document);
        
        // Add charts and visualizations
        addAnalyticsCharts(document);
        
        // Add footer
        addAnalyticsFooter(document);
        
        document.close();
        return baos.toByteArray();
    }
    
    private void addAnalyticsTitlePage(Document document) throws Exception {
        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
        Paragraph title = new Paragraph("BookBridge Analytics Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(30);
        document.add(title);
        
        // Subtitle
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 14);
        Paragraph subtitle = new Paragraph("Comprehensive Platform Performance Analysis", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
        
        // Date
        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Paragraph date = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), dateFont);
        date.setAlignment(Element.ALIGN_CENTER);
        date.setSpacingAfter(40);
        document.add(date);
        
        // Add line separator
        LineSeparator line = new LineSeparator();
        line.setLineWidth(1);
        document.add(line);
        document.add(new Paragraph("\n"));
    }
    
    private void addExecutiveSummary(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph sectionTitle = new Paragraph("Executive Summary", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        // Get key metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        
        long totalUsers = userService.getAllUsers().size();
        long totalBooks = bookService.getAllBooks().size();
        long totalOrders = orderService.countAllOrders();
        Double totalRevenue = orderService.sumOrderAmountBetweenDates(startOfYear, now);
        
        // Create summary table
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        
        addSummaryRow(summaryTable, "Total Users", String.valueOf(totalUsers));
        addSummaryRow(summaryTable, "Total Books", String.valueOf(totalBooks));
        addSummaryRow(summaryTable, "Total Orders", String.valueOf(totalOrders));
        addSummaryRow(summaryTable, "Total Revenue (Rs.)", String.valueOf(totalRevenue != null ? totalRevenue : 0));
        addSummaryRow(summaryTable, "Monthly Active Users", String.valueOf(userService.countUsersCreatedAfter(startOfMonth)));
        addSummaryRow(summaryTable, "Books Listed This Month", String.valueOf(bookService.countBooksCreatedAfter(startOfMonth)));
        
        document.add(summaryTable);
        document.add(new Paragraph("\n"));
    }
    
    private void addSummaryRow(PdfPTable table, String label, String value) throws Exception {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        labelCell.setPadding(8);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
    
    private void addOrderAnalytics(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Order Analytics", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        // Order statistics
        long totalOrders = orderService.countAllOrders();
        long ordersThisMonth = orderService.countOrdersCreatedAfter(startOfMonth);
        long pendingOrders = orderService.countOrdersByStatus(Order.OrderStatus.PENDING);
        long deliveredOrders = orderService.countOrdersByStatus(Order.OrderStatus.DELIVERED);
        long cancelledOrders = orderService.countOrdersByStatus(Order.OrderStatus.CANCELLED);
        
        PdfPTable orderTable = new PdfPTable(2);
        orderTable.setWidthPercentage(100);
        
        addSummaryRow(orderTable, "Total Orders", String.valueOf(totalOrders));
        addSummaryRow(orderTable, "Orders This Month", String.valueOf(ordersThisMonth));
        addSummaryRow(orderTable, "Pending Orders", String.valueOf(pendingOrders));
        addSummaryRow(orderTable, "Delivered Orders", String.valueOf(deliveredOrders));
        addSummaryRow(orderTable, "Cancelled Orders", String.valueOf(cancelledOrders));
        
        document.add(orderTable);
        document.add(new Paragraph("\n"));
    }
    
    private void addBookAnalytics(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Book Analytics", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        List<Book> allBooks = bookService.getAllBooks();
        long totalBooks = allBooks.size();
        long availableBooks = bookService.countBooksByStatus(Book.BookStatus.AVAILABLE);
        long soldBooks = bookService.countBooksByStatus(Book.BookStatus.SOLD);
        
        // Book category breakdown
        Map<String, Long> categoryStats = allBooks.stream()
            .collect(Collectors.groupingBy(
                book -> book.getCategory() != null ? book.getCategory().name() : "Uncategorized",
                Collectors.counting()
            ));
        
        PdfPTable bookTable = new PdfPTable(2);
        bookTable.setWidthPercentage(100);
        
        addSummaryRow(bookTable, "Total Books", String.valueOf(totalBooks));
        addSummaryRow(bookTable, "Available Books", String.valueOf(availableBooks));
        addSummaryRow(bookTable, "Sold Books", String.valueOf(soldBooks));
        
        document.add(bookTable);
        
        // Category breakdown
        if (!categoryStats.isEmpty()) {
            document.add(new Paragraph("\nBook Categories:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            
            PdfPTable categoryTable = new PdfPTable(2);
            categoryTable.setWidthPercentage(100);
            
            for (Map.Entry<String, Long> entry : categoryStats.entrySet()) {
                addSummaryRow(categoryTable, entry.getKey(), String.valueOf(entry.getValue()));
            }
            
            document.add(categoryTable);
        }
        
        document.add(new Paragraph("\n"));
    }
    
    private void addUserAnalytics(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("User Analytics", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        List<User> allUsers = userService.getAllUsers();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count();
        long blockedUsers = allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.BLOCKED).count();
        
        // User type breakdown
        Map<String, Long> userTypeStats = allUsers.stream()
            .collect(Collectors.groupingBy(
                user -> user.getUserType() != null ? user.getUserType().toString() : "Unknown",
                Collectors.counting()
            ));
        
        PdfPTable userTable = new PdfPTable(2);
        userTable.setWidthPercentage(100);
        
        addSummaryRow(userTable, "Total Users", String.valueOf(totalUsers));
        addSummaryRow(userTable, "Active Users", String.valueOf(activeUsers));
        addSummaryRow(userTable, "Blocked Users", String.valueOf(blockedUsers));
        
        document.add(userTable);
        
        // User type breakdown
        if (!userTypeStats.isEmpty()) {
            document.add(new Paragraph("\nUser Types:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            
            PdfPTable userTypeTable = new PdfPTable(2);
            userTypeTable.setWidthPercentage(100);
            
            for (Map.Entry<String, Long> entry : userTypeStats.entrySet()) {
                addSummaryRow(userTypeTable, entry.getKey(), String.valueOf(entry.getValue()));
            }
            
            document.add(userTypeTable);
        }
        
        document.add(new Paragraph("\n"));
    }
    
    private void addPaymentAnalytics(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Payment Analytics", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        long totalPayments = paymentService.countAllPayments();
        long completedPayments = paymentService.countPaymentsByStatus(Payment.PaymentStatus.COMPLETED);
        long pendingPayments = paymentService.countPaymentsByStatus(Payment.PaymentStatus.PENDING);
        long failedPayments = paymentService.countPaymentsByStatus(Payment.PaymentStatus.FAILED);
        
        // Payment method breakdown
        long esewaPayments = paymentService.countPaymentsByMethod(Payment.PaymentMethod.ESEWA);
        long cashPayments = paymentService.countPaymentsByMethod(Payment.PaymentMethod.CASH);
        
        PdfPTable paymentTable = new PdfPTable(2);
        paymentTable.setWidthPercentage(100);
        
        addSummaryRow(paymentTable, "Total Payments", String.valueOf(totalPayments));
        addSummaryRow(paymentTable, "Completed Payments", String.valueOf(completedPayments));
        addSummaryRow(paymentTable, "Pending Payments", String.valueOf(pendingPayments));
        addSummaryRow(paymentTable, "Failed Payments", String.valueOf(failedPayments));
        addSummaryRow(paymentTable, "Esewa Payments", String.valueOf(esewaPayments));
        addSummaryRow(paymentTable, "Cash Payments", String.valueOf(cashPayments));
        
        document.add(paymentTable);
        document.add(new Paragraph("\n"));
    }
    
    private void addRevenueAnalytics(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Revenue Analytics", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfYear = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        
        Double totalRevenue = orderService.sumOrderAmountBetweenDates(startOfYear, now);
        Double monthlyRevenue = orderService.sumOrderAmountBetweenDates(startOfMonth, now);
        Double paymentRevenue = paymentService.sumSuccessfulPaymentsBetweenDates(startOfYear, now);
        
        PdfPTable revenueTable = new PdfPTable(2);
        revenueTable.setWidthPercentage(100);
        
        addSummaryRow(revenueTable, "Total Revenue (Rs.)", String.valueOf(totalRevenue != null ? totalRevenue : 0));
        addSummaryRow(revenueTable, "Monthly Revenue (Rs.)", String.valueOf(monthlyRevenue != null ? monthlyRevenue : 0));
        addSummaryRow(revenueTable, "Payment Revenue (Rs.)", String.valueOf(paymentRevenue != null ? paymentRevenue : 0));
        
        document.add(revenueTable);
        document.add(new Paragraph("\n"));
    }
    
    private void addAnalyticsCharts(Document document) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Data Visualizations", sectionFont);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
        
        // Create simple text-based charts since iText doesn't have built-in charting
        addTextBasedCharts(document);
    }
    
    private void addTextBasedCharts(Document document) throws Exception {
        Font chartFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        
        // Order Status Distribution
        long totalOrders = orderService.countAllOrders();
        long pendingOrders = orderService.countOrdersByStatus(Order.OrderStatus.PENDING);
        long deliveredOrders = orderService.countOrdersByStatus(Order.OrderStatus.DELIVERED);
        long cancelledOrders = orderService.countOrdersByStatus(Order.OrderStatus.CANCELLED);
        
        Paragraph orderChart = new Paragraph("Order Status Distribution:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        orderChart.setSpacingAfter(10);
        document.add(orderChart);
        
        if (totalOrders > 0) {
            addBarChart(document, "Pending", pendingOrders, totalOrders, 50);
            addBarChart(document, "Delivered", deliveredOrders, totalOrders, 50);
            addBarChart(document, "Cancelled", cancelledOrders, totalOrders, 50);
        }
        
        document.add(new Paragraph("\n"));
        
        // Book Status Distribution
        List<Book> allBooks = bookService.getAllBooks();
        long totalBooks = allBooks.size();
        long availableBooks = bookService.countBooksByStatus(Book.BookStatus.AVAILABLE);
        long soldBooks = bookService.countBooksByStatus(Book.BookStatus.SOLD);
        
        Paragraph bookChart = new Paragraph("Book Status Distribution:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        bookChart.setSpacingAfter(10);
        document.add(bookChart);
        
        if (totalBooks > 0) {
            addBarChart(document, "Available", availableBooks, totalBooks, 50);
            addBarChart(document, "Sold", soldBooks, totalBooks, 50);
        }
        
        document.add(new Paragraph("\n"));
    }
    
    private void addBarChart(Document document, String label, long value, long total, int maxBars) throws Exception {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        
        double percentage = total > 0 ? (double) value / total : 0;
        int bars = (int) (percentage * maxBars);
        
        StringBuilder bar = new StringBuilder();
        for (int i = 0; i < bars; i++) {
            bar.append("█");
        }
        
        Paragraph chartRow = new Paragraph();
        chartRow.add(new Chunk(String.format("%-12s", label), labelFont));
        chartRow.add(new Chunk(bar.toString(), valueFont));
        chartRow.add(new Chunk(String.format(" %d (%.1f%%)", value, percentage * 100), valueFont));
        
        document.add(chartRow);
    }
    
    private void addAnalyticsFooter(Document document) throws Exception {
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
        Paragraph footer = new Paragraph();
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.add(new Chunk("BookBridge Analytics Report\n", footerFont));
        footer.add(new Chunk("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) + "\n", footerFont));
        footer.add(new Chunk("For support, contact: support@bookbridge.com", footerFont));
        document.add(footer);
    }
    
    private void addHeader(Document document, Order order) throws Exception {
        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("BookBridge - Order Invoice", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
        
        // Order info
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Paragraph orderInfo = new Paragraph();
        orderInfo.add(new Chunk("Order Number: ", headerFont));
        orderInfo.add(new Chunk(order.getOrderNumber(), FontFactory.getFont(FontFactory.HELVETICA, 12)));
        orderInfo.add(new Chunk("\nOrder Date: ", headerFont));
        orderInfo.add(new Chunk(order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), 
                               FontFactory.getFont(FontFactory.HELVETICA, 12)));
        orderInfo.setSpacingAfter(20);
        document.add(orderInfo);
    }
    
    private void addOrderDetails(Document document, Order order) throws Exception {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        
        Paragraph customerInfo = new Paragraph();
        customerInfo.add(new Chunk("Customer Information\n", headerFont));
        customerInfo.add(new Chunk("Name: " + order.getUser().getFullName() + "\n", normalFont));
        customerInfo.add(new Chunk("Email: " + order.getUser().getEmail() + "\n", normalFont));
        if (order.getDeliveryAddress() != null) {
            customerInfo.add(new Chunk("Delivery Address: " + order.getDeliveryAddress() + "\n", normalFont));
        }
        if (order.getDeliveryPhone() != null) {
            customerInfo.add(new Chunk("Phone: " + order.getDeliveryPhone() + "\n", normalFont));
        }
        customerInfo.setSpacingAfter(20);
        document.add(customerInfo);
    }
    
    private void addItemsTable(Document document, List<OrderItem> items) throws Exception {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        
        // Add headers
        String[] headers = {"Book Title", "Author", "Quantity", "Price"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }
        
        // Add items
        for (OrderItem item : items) {
            table.addCell(new PdfPCell(new Phrase(item.getBook().getTitle(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(item.getBook().getAuthor(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont)));
            table.addCell(new PdfPCell(new Phrase("Rs. " + item.getUnitPrice(), normalFont)));
        }
        
        document.add(table);
        document.add(new Paragraph("\n"));
    }
    
    private void addTotal(Document document, Order order) throws Exception {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        
        Paragraph total = new Paragraph();
        total.setAlignment(Element.ALIGN_RIGHT);
        total.add(new Chunk("Total Amount: Rs. " + order.getTotalAmount() + "/-", headerFont));
        total.setSpacingAfter(20);
        document.add(total);
    }
    
    private void addFooter(Document document) throws Exception {
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
        Paragraph footer = new Paragraph();
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.add(new Chunk("Thank you for your purchase!\n", footerFont));
        footer.add(new Chunk("BookBridge - Connecting Readers Through Books\n", footerFont));
        footer.add(new Chunk("For support, contact: support@bookbridge.com", footerFont));
        document.add(footer);
    }
} 