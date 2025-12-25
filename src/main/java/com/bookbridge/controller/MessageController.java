package com.bookbridge.controller;

import com.bookbridge.model.Book;
import com.bookbridge.model.Message;
import com.bookbridge.model.User;
import com.bookbridge.service.BookService;
import com.bookbridge.service.MessageService;
import com.bookbridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> messageRequest) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> senderOpt = userService.getUserByEmail(userEmail);
            if (!senderOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User sender = senderOpt.get();
            Long receiverId = Long.valueOf(messageRequest.get("receiverId").toString());
            String content = messageRequest.get("content").toString();
            Long bookId = messageRequest.get("bookId") != null ? 
                Long.valueOf(messageRequest.get("bookId").toString()) : null;
            
            User receiver = userService.getUserById(receiverId);
            
            if (receiver == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid receiver"));
            }
            
            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setContent(content);
            
            if (bookId != null) {
                Optional<Book> bookOpt = bookService.getBookById(bookId);
                if (bookOpt.isPresent()) {
                    message.setBook(bookOpt.get());
                }
            }
            
            Message savedMessage = messageService.saveMessage(message);
            
            return ResponseEntity.ok(Map.of(
                "message", "Message sent successfully",
                "data", savedMessage
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error sending message: " + e.getMessage()));
        }
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            // Get current user from Spring Security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }
            
            String userEmail = authentication.getName();
            Optional<User> currentUserOpt = userService.getUserByEmail(userEmail);
            if (!currentUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }
            
            User otherUser = userService.getUserById(userId);
            
            if (otherUser == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid user"));
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messages = messageService.getConversationPaged(
                currentUserOpt.get(), otherUser, pageable);
            
            // Mark messages as read
            messageService.markAllAsRead(currentUserOpt.get(), otherUser);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching conversation: " + e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages() {
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
            
            List<Message> unreadMessages = messageService.getUnreadMessages(userOpt.get());
            Long unreadCount = messageService.countUnreadMessages(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "messages", unreadMessages,
                "count", unreadCount
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching unread messages: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            boolean success = messageService.markAsRead(id);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Message marked as read"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error marking message as read: " + e.getMessage()));
        }
    }

    @GetMapping("/partners")
    public ResponseEntity<?> getChatPartners() {
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
            
            List<User> chatPartners = messageService.getChatPartners(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "partners", chatPartners
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching chat partners: " + e.getMessage()));
        }
    }

    @MessageMapping("/chat.sendMessage")
    public void handleWebSocketMessage(@Payload Map<String, Object> messagePayload) {
        try {
            // Note: WebSocket authentication is handled separately
            // This method is called when a WebSocket message is received
            Long senderId = Long.valueOf(messagePayload.get("senderId").toString());
            Long receiverId = Long.valueOf(messagePayload.get("receiverId").toString());
            String content = messagePayload.get("content").toString();
            
            User sender = userService.getUserById(senderId);
            User receiver = userService.getUserById(receiverId);
            
            if (sender != null && receiver != null) {
                Message message = new Message();
                message.setSender(sender);
                message.setReceiver(receiver);
                message.setContent(content);
                
                Message savedMessage = messageService.saveMessage(message);
                
                // Send message to specific user via WebSocket
                messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/topic/messages",
                    savedMessage
                );
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
        }
    }
}
