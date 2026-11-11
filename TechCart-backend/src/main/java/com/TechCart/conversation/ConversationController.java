package com.TechCart.conversation;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TechCart.conversation.dto.ConversationResponse;
import com.TechCart.conversation.dto.CreateConversationRequest;
import com.TechCart.conversation.dto.CreateMessageRequest;
import com.TechCart.conversation.dto.MessageResponse;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    public ConversationController(
            ConversationService conversationService,
            MessageService messageService) {

        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    // Create conversation
    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody(required = false) CreateConversationRequest request,
            Authentication authentication) {

        String title = request == null ? null : request.getTitle();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.createConversation(title, authentication));
    }

    // Get all conversations
    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getAllConversations(
            Authentication authentication) {

        return ResponseEntity.ok(
                conversationService.getAllConversations(authentication));
    }

    // Get conversation by ID
    @GetMapping("/{converId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable Long converId,
            Authentication authentication) {

        return ResponseEntity.ok(
                conversationService.getConversation(converId, authentication));
    }

    // Delete conversation and its messages
    @DeleteMapping("/{converId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long converId,
            Authentication authentication) {

        conversationService.deleteConversation(converId, authentication);

        return ResponseEntity.noContent().build();
    }

    // Close conversation
    @PatchMapping("/{converId}/close")
    public ResponseEntity<Void> closeConversation(
            @PathVariable Long converId,
            Authentication authentication) {

        conversationService.closeConversation(converId, authentication);

        return ResponseEntity.noContent().build();
    }

    // Get all messages in a conversation
    @GetMapping("/{converId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long converId,
            Authentication authentication) {

        return ResponseEntity.ok(
                messageService.getMessages(converId, authentication));
    }

    // Save a message
    @PostMapping("/{converId}/messages")
    public ResponseEntity<MessageResponse> saveMessage(
            @PathVariable Long converId,
            @RequestBody CreateMessageRequest request,
            Authentication authentication) {

        MessageResponse response = messageService.saveMessage(
                converId,
                request.getRole(),
                request.getMessage(),
                authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}