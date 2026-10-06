package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.QuizRequest;
import com.placify.api.dto.QuizResultDto;
import com.placify.api.dto.QuizSubmitRequest;
import com.placify.api.model.DifficultyLevel;
import com.placify.api.model.Quiz;
import com.placify.api.model.QuizAttempt;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Quiz>>> getAllQuizzes(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) DifficultyLevel difficulty) {
        List<Quiz> quizzes = quizService.getAllQuizzes(category, difficulty);
        return ResponseEntity.ok(ApiResponse.ok("Quizzes retrieved successfully", quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Quiz>> getQuizById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // If user is STUDENT, sanitize correct answers to prevent inspecting payload
        boolean isStudent = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        Quiz quiz = quizService.getQuizById(id, isStudent);
        return ResponseEntity.ok(ApiResponse.ok("Quiz retrieved", quiz));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Quiz>> createQuiz(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody QuizRequest request) {
        Quiz created = quizService.createQuiz(request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Quiz created successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable String id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(ApiResponse.ok("Quiz deleted successfully"));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody QuizSubmitRequest request) {
        QuizResultDto result = quizService.submitQuiz(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Quiz submitted and evaluated successfully", result));
    }

    @GetMapping("/attempts/my-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<QuizAttempt>>> getMyAttempts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<QuizAttempt> attempts = quizService.getMyQuizAttempts(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Quiz performance history retrieved", attempts));
    }
}
