package com.placify.api.controller;

import com.placify.api.dto.AiChatRequestDto;
import com.placify.api.dto.AiChatResponseDto;
import com.placify.api.dto.ApiResponse;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.AiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    @Autowired
    private AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponseDto>> sendChatMessage(
            @RequestBody AiChatRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String userId = userPrincipal != null ? userPrincipal.getId() : null;
        AiChatResponseDto response = aiAssistantService.processChat(userId, request);

        return ResponseEntity.ok(ApiResponse.ok("AI Assistant response generated successfully", response));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSuggestedPrompts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String userId = userPrincipal != null ? userPrincipal.getId() : null;
        List<String> suggestions = aiAssistantService.getSuggestedPrompts(userId);

        return ResponseEntity.ok(ApiResponse.ok("Suggested prompts retrieved", suggestions));
    }
}
