package com.bookbridge.controller;

import com.bookbridge.model.Book;
import com.bookbridge.model.User;
import com.bookbridge.service.BookService;
import com.bookbridge.service.FileStorageService;
import com.bookbridge.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<?> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String location) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Book> books;

            Book.BookCategory bookCategory = null;
            Book.BookCondition bookCondition = null;
            Book.ListingType bookListingType = null;

            // Safe enum parsing
            if (category != null) {
                try {
                    bookCategory = Book.BookCategory.valueOf(category.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid category: " + category));
                }
            }
            if (condition != null) {
                try {
                    bookCondition = Book.BookCondition.valueOf(condition.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid condition: " + condition));
                }
            }
            if (listingType != null) {
                try {
                    bookListingType = Book.ListingType.valueOf(listingType.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid listingType: " + listingType));
                }
            }

            if (keyword != null || category != null || condition != null || listingType != null || location != null) {
                books = bookService.searchBooksWithFilters(
                    keyword != null ? keyword : "",
                    bookCategory,
                    bookCondition,
                    bookListingType,
                    location != null ? location : "",
                    pageable
                );
            } else {
                books = bookService.getAvailableBooks(pageable);
            }
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching books: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        Optional<Book> bookOpt = bookService.getBookById(id);
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            // Increment view count
            bookService.incrementViewCount(id);
            return ResponseEntity.ok(book);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam("condition") String condition,
            @RequestParam("listingType") String listingType,
            @RequestParam("location") String location,
            @RequestParam(value = "edition", required = false) String edition,
            @RequestParam(value = "isbn", required = false) String isbn,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "bookImage", required = false) MultipartFile bookImage,
            HttpServletRequest request) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User user = userOpt.get();
            
            // Create book
            Book book = new Book();
            book.setTitle(title);
            book.setAuthor(author);
            book.setCategory(Book.BookCategory.valueOf(category.toUpperCase()));
            book.setCondition(Book.BookCondition.valueOf(condition.toUpperCase()));
            book.setListingType(Book.ListingType.valueOf(listingType.toUpperCase()));
            book.setLocation(location);
            book.setEdition(edition);
            book.setIsbn(isbn);
            book.setDescription(description);
            book.setUser(user);
            
            // Set price if listing type is SELL
            if (book.getListingType() == Book.ListingType.SELL && price != null) {
                book.setPrice(new BigDecimal(price));
            }
            
            // Store book image if provided
            if (bookImage != null && !bookImage.isEmpty()) {
                String imagePath = fileStorageService.storeBookImage(bookImage);
                book.setBookImage(imagePath);
            }
            
            Book savedBook = bookService.createBook(book);
            
            return ResponseEntity.ok(Map.of(
                "message", "Book created successfully",
                "book", savedBook
            ));
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload book image"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating book: " + e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBooksFromCSV(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User user = userOpt.get();
            
            // Validate file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "CSV file is required"));
            }
            
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "File must be a CSV file"));
            }
            
            // Parse CSV and create books
            List<Book> createdBooks = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreHeaderCase(true)
                        .setTrim(true)
                        .build())) {
                
                List<CSVRecord> records = csvParser.getRecords();
                
                if (records.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "CSV file is empty or has no data rows"));
                }
                
                int rowNumber = 1; // Start from 1 (header is row 0, first data row is 1)
                
                for (CSVRecord record : records) {
                    rowNumber++;
                    try {
                        // Validate required fields
                        String title = record.get("title");
                        String author = record.get("author");
                        String category = record.get("category");
                        String condition = record.get("condition");
                        String listingType = record.get("listingType");
                        String location = record.get("location");
                        
                        if (title == null || title.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": title is required");
                            continue;
                        }
                        if (author == null || author.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": author is required");
                            continue;
                        }
                        if (category == null || category.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": category is required");
                            continue;
                        }
                        if (condition == null || condition.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": condition is required");
                            continue;
                        }
                        if (listingType == null || listingType.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": listingType is required");
                            continue;
                        }
                        if (location == null || location.trim().isEmpty()) {
                            errors.add("Row " + rowNumber + ": location is required");
                            continue;
                        }
                        
                        // Create book
                        Book book = new Book();
                        book.setTitle(title.trim());
                        book.setAuthor(author.trim());
                        
                        // Parse enums
                        try {
                            book.setCategory(Book.BookCategory.valueOf(category.trim().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + rowNumber + ": Invalid category '" + category + "'. Valid values: " + 
                                    Arrays.stream(Book.BookCategory.values())
                                            .map(Enum::name)
                                            .collect(Collectors.joining(", ")));
                            continue;
                        }
                        
                        try {
                            book.setCondition(Book.BookCondition.valueOf(condition.trim().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + rowNumber + ": Invalid condition '" + condition + "'. Valid values: " + 
                                    Arrays.stream(Book.BookCondition.values())
                                            .map(Enum::name)
                                            .collect(Collectors.joining(", ")));
                            continue;
                        }
                        
                        try {
                            book.setListingType(Book.ListingType.valueOf(listingType.trim().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            errors.add("Row " + rowNumber + ": Invalid listingType '" + listingType + "'. Valid values: " + 
                                    Arrays.stream(Book.ListingType.values())
                                            .map(Enum::name)
                                            .collect(Collectors.joining(", ")));
                            continue;
                        }
                        
                        book.setLocation(location.trim());
                        
                        // Optional fields
                        try {
                            String edition = record.get("edition");
                            if (edition != null && !edition.trim().isEmpty()) {
                                book.setEdition(edition.trim());
                            }
                        } catch (IllegalArgumentException e) {
                            // Column doesn't exist, skip
                        }
                        
                        try {
                            String isbn = record.get("isbn");
                            if (isbn != null && !isbn.trim().isEmpty()) {
                                book.setIsbn(isbn.trim());
                            }
                        } catch (IllegalArgumentException e) {
                            // Column doesn't exist, skip
                        }
                        
                        try {
                            String description = record.get("description");
                            if (description != null && !description.trim().isEmpty()) {
                                book.setDescription(description.trim());
                            }
                        } catch (IllegalArgumentException e) {
                            // Column doesn't exist, skip
                        }
                        
                        try {
                            String price = record.get("price");
                            if (price != null && !price.trim().isEmpty()) {
                                if (book.getListingType() == Book.ListingType.SELL) {
                                    try {
                                        book.setPrice(new BigDecimal(price.trim()));
                                    } catch (NumberFormatException e) {
                                        errors.add("Row " + rowNumber + ": Invalid price format '" + price + "'");
                                        continue;
                                    }
                                }
                            }
                        } catch (IllegalArgumentException e) {
                            // Column doesn't exist, skip
                        }
                        
                        book.setUser(user);
                        book.setStatus(Book.BookStatus.AVAILABLE);
                        
                        Book savedBook = bookService.createBook(book);
                        createdBooks.add(savedBook);
                        
                    } catch (Exception e) {
                        errors.add("Row " + rowNumber + ": " + e.getMessage());
                    }
                }
            }
            
            // Prepare response
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "CSV upload completed");
            response.put("successCount", createdBooks.size());
            response.put("errorCount", errors.size());
            response.put("createdBooks", createdBooks);
            
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            
            if (createdBooks.isEmpty() && !errors.isEmpty()) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to read CSV file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing CSV file: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam("condition") String condition,
            @RequestParam("listingType") String listingType,
            @RequestParam("location") String location,
            @RequestParam(value = "edition", required = false) String edition,
            @RequestParam(value = "isbn", required = false) String isbn,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "bookImage", required = false) MultipartFile bookImage,
            HttpServletRequest request) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Long userId = currentUser.getId();
            Optional<Book> bookOpt = bookService.getBookById(id);
            
            if (!bookOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Book book = bookOpt.get();
            
            // Check if user owns this book
            if (!book.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only edit your own books"));
            }
            
            // Update book details
            book.setTitle(title);
            book.setAuthor(author);
            book.setCategory(Book.BookCategory.valueOf(category.toUpperCase()));
            book.setCondition(Book.BookCondition.valueOf(condition.toUpperCase()));
            book.setListingType(Book.ListingType.valueOf(listingType.toUpperCase()));
            book.setLocation(location);
            book.setEdition(edition);
            book.setIsbn(isbn);
            book.setDescription(description);
            
            // Set price if listing type is SELL
            if (book.getListingType() == Book.ListingType.SELL && price != null) {
                book.setPrice(new BigDecimal(price));
            } else {
                book.setPrice(null);
            }
            
            // Update book image if provided
            if (bookImage != null && !bookImage.isEmpty()) {
                // Delete old image if exists
                if (book.getBookImage() != null) {
                    fileStorageService.deleteFile(book.getBookImage());
                }
                String imagePath = fileStorageService.storeBookImage(bookImage);
                book.setBookImage(imagePath);
            }
            
            Book updatedBook = bookService.updateBook(book);
            
            return ResponseEntity.ok(Map.of(
                "message", "Book updated successfully",
                "book", updatedBook
            ));
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload book image"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating book: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User currentUser = userOpt.get();
            Long userId = currentUser.getId();
            Optional<Book> bookOpt = bookService.getBookById(id);
            
            if (!bookOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Book book = bookOpt.get();
            
            // Check if user owns this book
            if (!book.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only delete your own books"));
            }
            
            boolean deleted = bookService.deleteBook(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to delete book"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting book: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBooks(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<Book> books = bookService.getBooksByUser(user);
            return ResponseEntity.ok(books);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching user books: " + e.getMessage()));
        }
    }

    @GetMapping("/my-books")
    public ResponseEntity<?> getMyBooks(HttpServletRequest request) {
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            List<Book> books = bookService.getBooksByUser(userOpt.get());
            return ResponseEntity.ok(books);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching user books: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/interest")
    public ResponseEntity<?> expressInterest(@PathVariable Long id) {
        try {
            bookService.incrementInterestCount(id);
            return ResponseEntity.ok(Map.of("message", "Interest recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error recording interest: " + e.getMessage()));
        }
    }
}
