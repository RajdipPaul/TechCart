package com.TechCart.conversation;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.TechCart.conversation.dto.ConversationResponse;
import com.TechCart.user.User;
import com.TechCart.user.UserRepository;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    // Create a new conversation
    public ConversationResponse createConversation(
            String title, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setTitle(
                title == null || title.isBlank()
                        ? "New Conversation"
                        : title.trim()
        );
        conversation.setStatus("ACTIVE");

        return convertToResponse(conversationRepository.save(conversation));
    }

    // Get all conversations belonging to the logged-in user
    public List<ConversationResponse> getAllConversations(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return conversationRepository
                .findByUserUserIdOrderByUpdatedAtDesc(user.getUserId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Get a specific conversation
    public ConversationResponse getConversation(
            Long converId, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Conversation conversation = conversationRepository
                .findByConverIdAndUserUserId(converId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found"));

        return convertToResponse(conversation);
    }

    // Close a conversation
    @Transactional
    public void closeConversation(
            Long converId, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Conversation conversation = conversationRepository
                .findByConverIdAndUserUserId(converId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found"));

        if ("CLOSED".equalsIgnoreCase(conversation.getStatus())) {
            throw new IllegalArgumentException("Conversation is already closed");
        }

        conversation.setStatus("CLOSED");
        conversation.setUpdatedAt(LocalDateTime.now());

        conversationRepository.save(conversation);
    }

    // Permanently delete a conversation and its messages
    @Transactional
    public void deleteConversation(
            Long converId, Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Conversation conversation = conversationRepository
                .findByConverIdAndUserUserId(converId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Conversation not found"));

        List<Message> messages = messageRepository
                .findByConversationConverIdOrderByCreatedAtAsc(converId);

        messageRepository.deleteAll(messages);
        conversationRepository.delete(conversation);
    }

    // Get the authenticated user
    private User getAuthenticatedUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    // Convert entity to response DTO
    private ConversationResponse convertToResponse(
            Conversation conversation) {

        ConversationResponse response = new ConversationResponse();

        response.setConverId(conversation.getConverId());
        response.setTitle(conversation.getTitle());
        response.setStatus(conversation.getStatus());
        response.setCreatedAt(conversation.getCreatedAt());
        response.setUpdatedAt(conversation.getUpdatedAt());

        return response;
    }
}