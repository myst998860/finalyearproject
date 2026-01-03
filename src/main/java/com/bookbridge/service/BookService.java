package com.bookbridge.service;

import com.bookbridge.model.Book;
import com.bookbridge.model.User;
import com.bookbridge.repository.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        try {
            return bookRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve all books", e);
        }
    }

    public Page<Book> getAvailableBooks(Pageable pageable) {
        try {
            return bookRepository.findAvailableBooks(pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve available books", e);
        }
    }

    public Optional<Book> getBookById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            return bookRepository.findByIdAndNotDeleted(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve book with ID: " + id, e);
        }
    }

    public Optional<Book> getBookByIdIncludingDeleted(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            return bookRepository.findById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve book with ID: " + id, e);
        }
    }

    public List<Book> getBooksByUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            return bookRepository.findByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve books for user: " + user.getId(), e);
        }
    }

    public List<Book> getAllBooksByUserIncludingDeleted(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            return bookRepository.findAllByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve all books for user: " + user.getId(), e);
        }
    }

    @Transactional
    public Book createBook(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null");
        }
        if (book.getUser() == null) {
            throw new IllegalArgumentException("Book must have an associated user");
        }
        try {
            return bookRepository.save(book);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create book", e);
        }
    }

    @Transactional
    public Book updateBook(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null");
        }
        if (book.getId() == null) {
            throw new IllegalArgumentException("Book ID cannot be null for update");
        }
        try {
            return bookRepository.save(book);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update book with ID: " + book.getId(), e);
        }
    }

    @Transactional
    public boolean deleteBook(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                book.setStatus(Book.BookStatus.DELETED);
                bookRepository.save(book);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete book with ID: " + id, e);
        }
    }

    @Transactional
    public boolean hardDeleteBook(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            if (bookRepository.existsById(id)) {
                bookRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to hard delete book with ID: " + id, e);
        }
    }

    public Page<Book> searchBooks(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Search keyword cannot be null or empty");
        }
        try {
            return bookRepository.searchBooks(keyword, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search books with keyword: " + keyword, e);
        }
    }

    public Page<Book> findByCategory(Book.BookCategory category, Pageable pageable) {
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        try {
            return bookRepository.findByCategory(category, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to find books by category: " + category, e);
        }
    }

    public Page<Book> findByCondition(Book.BookCondition condition, Pageable pageable) {
        if (condition == null) {
            throw new IllegalArgumentException("Condition cannot be null");
        }
        try {
            return bookRepository.findByCondition(condition, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to find books by condition: " + condition, e);
        }
    }

    public Page<Book> findByListingType(Book.ListingType listingType, Pageable pageable) {
        if (listingType == null) {
            throw new IllegalArgumentException("Listing type cannot be null");
        }
        try {
            return bookRepository.findByListingType(listingType, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to find books by listing type: " + listingType, e);
        }
    }

    public Page<Book> findByLocation(String location, Pageable pageable) {
        if (location == null || location.trim().isEmpty()) {
            throw new IllegalArgumentException("Location cannot be null or empty");
        }
        try {
            return bookRepository.findByLocation(location, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to find books by location: " + location, e);
        }
    }

    public Page<Book> searchBooksWithFilters(String keyword, Book.BookCategory category,
            Book.BookCondition condition, Book.ListingType listingType,
            String location, Pageable pageable) {
        try {
            return bookRepository.searchBooksWithFilters(keyword, category, condition, listingType, location, pageable);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search books with filters", e);
        }
    }

    @Transactional
    public void incrementViewCount(Long bookId) {
        if (bookId == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                book.incrementViewCount();
                bookRepository.save(book);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to increment view count for book ID: " + bookId, e);
        }
    }

    @Transactional
    public void incrementInterestCount(Long bookId) {
        if (bookId == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        try {
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                book.incrementInterestCount();
                bookRepository.save(book);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to increment interest count for book ID: " + bookId, e);
        }
    }

    @Transactional
    public boolean updateBookStatus(Long bookId, Book.BookStatus status) {
        if (bookId == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Book status cannot be null");
        }
        try {
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                book.setStatus(status);
                bookRepository.save(book);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update book status for book ID: " + bookId, e);
        }
    }

    public Long countBooksCreatedAfter(LocalDateTime date) {
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        try {
            return bookRepository.countBooksCreatedAfter(date);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count books created after: " + date, e);
        }
    }

    public Long countBooksByStatus(Book.BookStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Book status cannot be null");
        }
        try {
            return bookRepository.countBooksByStatus(status);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count books by status: " + status, e);
        }
    }

    public Long countAllBooksNotDeleted() {
        try {
            return bookRepository.countAllBooksNotDeleted();
        } catch (Exception e) {
            throw new RuntimeException("Failed to count all non-deleted books", e);
        }
    }
}
