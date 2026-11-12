
package com.TechCart.ai.dto;

public class AiChatRequest {

    private Long converId;
    private String message;

    public Long getConverId() {
        return converId;
    }

    public void setConverId(Long converId) {
        this.converId = converId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
