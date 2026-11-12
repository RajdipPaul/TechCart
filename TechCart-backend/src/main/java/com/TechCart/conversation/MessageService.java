package com.TechCart.conversation;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TechCart.conversation.dto.MessageResponse;
import com.TechCart.user.User;
import com.TechCart.user.UserRepository;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository) {

        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    // Save a new message
    @Transactional
    public MessageResponse saveMessage(
            Long converId,
            String role,
            String content,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Conversation conversation = conversationRepository
                .findByConverIdAndUserUserId(converId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found"));

        // Only active conversations can receive messages
        if (!"ACTIVE".equalsIgnoreCase(conversation.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot send messages to a closed conversation");
        }

        // Validate message role
        if (role == null ||
                !(role.equalsIgnoreCase("USER")
                        || role.equalsIgnoreCase("ASSISTANT"))) {

            throw new IllegalArgumentException(
                    "Role must be USER or ASSISTANT");
        }

        // Validate message content
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setRole(role.toUpperCase());
        message.setMessage(content.trim());

        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return convertToResponse(messageRepository.save(message));
    }

    // Retrieve all messages of a conversation
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(
            Long converId, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        // Verify conversation ownership
        conversationRepository
                .findByConverIdAndUserUserId(converId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found"));

        return messageRepository
                .findByConversationConverIdOrderByCreatedAtAsc(converId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Get the authenticated user
    private User getAuthenticatedUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    // Convert entity to response DTO
    private MessageResponse convertToResponse(Message message) {

        MessageResponse response = new MessageResponse();

        response.setMsgId(message.getMsgId());
        response.setRole(message.getRole());
        response.setMessage(message.getMessage());
        response.setCreatedAt(message.getCreatedAt());

        return response;
    }
}