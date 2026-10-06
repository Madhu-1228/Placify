package com.placify.api.dto;

import java.util.ArrayList;
import java.util.List;

public class AiChatResponseDto {
    private String reply;
    private String source; // "GEMINI_AI" or "INTELLIGENT_ASSISTANT"
    private List<String> suggestedFollowUps = new ArrayList<>();
    private Long timestamp;

    public AiChatResponseDto() {
        this.timestamp = System.currentTimeMillis();
    }

    public AiChatResponseDto(String reply, String source, List<String> suggestedFollowUps) {
        this.reply = reply;
        this.source = source;
        this.suggestedFollowUps = suggestedFollowUps != null ? suggestedFollowUps : new ArrayList<>();
        this.timestamp = System.currentTimeMillis();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public List<String> getSuggestedFollowUps() {
        return suggestedFollowUps;
    }

    public void setSuggestedFollowUps(List<String> suggestedFollowUps) {
        this.suggestedFollowUps = suggestedFollowUps;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
