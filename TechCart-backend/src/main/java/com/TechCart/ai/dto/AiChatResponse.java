
package com.TechCart.ai.dto;

import com.TechCart.conversation.dto.MessageResponse;

public class AiChatResponse {

    private Long converId;
    private MessageResponse userMessage;
    private MessageResponse assistantMessage;

    public Long getConverId() {
        return converId;
    }

    public void setConverId(Long converId) {
        this.converId = converId;
    }

    public MessageResponse getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(MessageResponse userMessage) {
        this.userMessage = userMessage;
    }

    public MessageResponse getAssistantMessage() {
        return assistantMessage;
    }

    public void setAssistantMessage(MessageResponse assistantMessage) {
        this.assistantMessage = assistantMessage;
    }
}
