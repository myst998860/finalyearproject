package com.bookbridge.service;

import com.bookbridge.model.Book;
import com.bookbridge.model.CartItem;
import com.bookbridge.model.User;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;

    public CartService(CartItemRepository cartItemRepository, BookRepository bookRepository) {
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
    }

    public List<CartItem> getCartItems(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            return cartItemRepository.findByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve cart items for user: " + user.getId(), e);
        }
    }

    @Transactional
    public CartItem addToCart(User user, Long bookId, Integer quantity) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (bookId == null) {
            throw new IllegalArgumentException("Book ID cannot be null");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        try {
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                
                // Check if book is available
                if (book.getStatus() != Book.BookStatus.AVAILABLE) {
                    throw new IllegalStateException("Book is not available for purchase");
                }
                
                // Check if book is already in cart
                Optional<CartItem> existingItemOpt = cartItemRepository.findByUserAndBook(user, book);
                if (existingItemOpt.isPresent()) {
                    CartItem existingItem = existingItemOpt.get();
                    existingItem.setQuantity(existingItem.getQuantity() + quantity);
                    return cartItemRepository.save(existingItem);
                } else {
                    CartItem newItem = new CartItem(user, book, quantity);
                    return cartItemRepository.save(newItem);
                }
            }
            throw new IllegalArgumentException("Book not found with ID: " + bookId);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add book to cart", e);
        }
    }

    @Transactional
    public CartItem updateCartItemQuantity(Long cartItemId, Integer quantity) {
        if (cartItemId == null) {
            throw new IllegalArgumentException("Cart item ID cannot be null");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        try {
            Optional<CartItem> cartItemOpt = cartItemRepository.findById(cartItemId);
            if (cartItemOpt.isPresent()) {
                CartItem cartItem = cartItemOpt.get();
                cartItem.setQuantity(quantity);
                return cartItemRepository.save(cartItem);
            }
            throw new IllegalArgumentException("Cart item not found with ID: " + cartItemId);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update cart item quantity", e);
        }
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        if (cartItemId == null) {
            throw new IllegalArgumentException("Cart item ID cannot be null");
        }
        try {
            if (!cartItemRepository.existsById(cartItemId)) {
                throw new IllegalArgumentException("Cart item not found with ID: " + cartItemId);
            }
            cartItemRepository.deleteById(cartItemId);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove item from cart", e);
        }
    }

    @Transactional
    public void clearCart(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            cartItemRepository.deleteByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear cart for user: " + user.getId(), e);
        }
    }

    public Double calculateCartTotal(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            Double total = cartItemRepository.calculateCartTotal(user);
            return total != null ? total : 0.0;
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate cart total for user: " + user.getId(), e);
        }
    }

    public Long countCartItems(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        try {
            return cartItemRepository.countCartItemsByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count cart items for user: " + user.getId(), e);
        }
    }
}
