package com.placify.api.dto;

import java.util.ArrayList;
import java.util.List;

public class AiChatRequestDto {
    private String message;
    private List<ChatMessageDto> history = new ArrayList<>();

    public AiChatRequestDto() {
    }

    public AiChatRequestDto(String message, List<ChatMessageDto> history) {
        this.message = message;
        this.history = history != null ? history : new ArrayList<>();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ChatMessageDto> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageDto> history) {
        this.history = history != null ? history : new ArrayList<>();
    }
}
