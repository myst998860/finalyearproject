package com.bookbridge.service;

import com.bookbridge.model.Book;
import com.bookbridge.model.Order;
import com.bookbridge.model.User;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.CartItemRepository;
import com.bookbridge.repository.MessageRepository;
import com.bookbridge.repository.NotificationRepository;
import com.bookbridge.repository.OrderItemRepository;
import com.bookbridge.repository.OrderRepository;
import com.bookbridge.repository.PaymentRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User registerIndividualUser(User user) {
        user.setUserType(User.UserType.INDIVIDUAL);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public User registerOrganizationUser(User user) {
        user.setUserType(User.UserType.ORGANIZATION);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Delete notifications related to this user
            notificationRepository.deleteByUser(user);
            
            // Delete messages sent by or received by this user
            messageRepository.deleteBySenderOrReceiver(user, user);
            
            // Delete payments related to user's orders
            List<Order> userOrders = orderRepository.findByUser(user);
            for (Order order : userOrders) {
                paymentRepository.deleteByOrder(order);
            }
            
            // Delete order items related to user's orders
            for (Order order : userOrders) {
                orderItemRepository.deleteByOrder(order);
            }
            
            // Delete user's orders
            orderRepository.deleteByUser(user);
            
            // Delete cart items related to user's books
            List<Book> userBooks = bookRepository.findByUser(user);
            for (Book book : userBooks) {
                cartItemRepository.deleteByBook(book);
            }
            
            // Delete order items that reference user's books (to handle foreign key constraints)
            for (Book book : userBooks) {
                orderItemRepository.deleteByBook(book);
            }
            
            // Delete user's books
            bookRepository.deleteByUser(user);
            
            // Finally delete the user
            userRepository.delete(user);
        }
    }

    @Transactional
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean initiatePasswordReset(String token,String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean completePasswordReset(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean blockUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(User.UserStatus.BLOCKED);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean unblockUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<User> getUsersByType(User.UserType userType) {
        return userRepository.findByUserType(userType);
    }

    public Long countUsersCreatedAfter(LocalDateTime date) {
        return userRepository.countUsersCreatedAfter(date);
    }
}
