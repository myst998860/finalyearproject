package com.bookbridge.service;

import com.bookbridge.model.Book;
import com.bookbridge.model.Message;
import com.bookbridge.model.User;
import com.bookbridge.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Message> getConversation(User user1, User user2) {
        return messageRepository.findConversation(user1, user2);
    }

    public Page<Message> getConversationPaged(User user1, User user2, Pageable pageable) {
        return messageRepository.findConversationPaged(user1, user2, pageable);
    }

    public List<Message> getUnreadMessages(User user) {
        return messageRepository.findUnreadMessages(user);
    }

    public Long countUnreadMessages(User user) {
        return messageRepository.countUnreadMessages(user);
    }

    public List<Message> getMessagesByBook(Book book) {
        return messageRepository.findMessagesByBook(book);
    }

    public List<User> getChatPartners(User user) {
        return messageRepository.findChatPartners(user);
    }

    public Page<Message> getUserMessages(User user, Pageable pageable) {
        return messageRepository.findUserMessages(user, pageable);
    }

    @Transactional
    public Message saveMessage(Message message) {
        Message savedMessage = messageRepository.save(message);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
            message.getReceiver().getEmail(),
            "/queue/messages",
            savedMessage
        );
        
        return savedMessage;
    }

    @Transactional
    public boolean markAsRead(Long messageId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
            return true;
        }
        return false;
    }

    @Transactional
    public void markAllAsRead(User receiver, User sender) {
        List<Message> messages = messageRepository.findConversation(receiver, sender);
        for (Message message : messages) {
            if (message.getReceiver().equals(receiver) && !message.getIsRead()) {
                message.setIsRead(true);
                message.setReadAt(LocalDateTime.now());
                messageRepository.save(message);
            }
        }
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}
