package com.placify.api.service;

import com.placify.api.dto.QuizRequest;
import com.placify.api.dto.QuizResultDto;
import com.placify.api.dto.QuizSubmitRequest;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.*;
import com.placify.api.repository.QuizAttemptRepository;
import com.placify.api.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private StudentProfileService studentProfileService;

    public List<Quiz> getAllQuizzes(String category, DifficultyLevel difficulty) {
        List<Quiz> quizzes = quizRepository.findAllByOrderByCreatedAtDesc();

        return quizzes.stream()
                .filter(q -> {
                    if (StringUtils.hasText(category) && !category.equalsIgnoreCase("ALL")) {
                        if (q.getCategory() == null || !q.getCategory().equalsIgnoreCase(category)) {
                            return false;
                        }
                    }
                    if (difficulty != null && q.getDifficulty() != difficulty) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Quiz getQuizById(String id, boolean sanitizeForStudent) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + id));

        if (sanitizeForStudent) {
            Quiz sanitized = new Quiz();
            sanitized.setId(quiz.getId());
            sanitized.setTitle(quiz.getTitle());
            sanitized.setCategory(quiz.getCategory());
            sanitized.setDifficulty(quiz.getDifficulty());
            sanitized.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
            sanitized.setCreatedBy(quiz.getCreatedBy());
            sanitized.setCreatedAt(quiz.getCreatedAt());

            List<Question> sanitizedQuestions = quiz.getQuestions().stream().map(q -> {
                Question sq = new Question();
                sq.setId(q.getId());
                sq.setQuestionText(q.getQuestionText());
                sq.setOptions(q.getOptions());
                // Hide correct option index and explanation during active quiz taking
                sq.setCorrectOptionIndex(null);
                sq.setExplanation(null);
                return sq;
            }).collect(Collectors.toList());

            sanitized.setQuestions(sanitizedQuestions);
            return sanitized;
        }

        return quiz;
    }

    public Quiz createQuiz(QuizRequest request, String createdBy) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle().trim());
        quiz.setCategory(request.getCategory().trim());
        quiz.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : DifficultyLevel.MEDIUM);
        quiz.setTimeLimitMinutes(request.getTimeLimitMinutes() != null ? request.getTimeLimitMinutes() : 15);
        quiz.setQuestions(request.getQuestions());
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedAt(Instant.now());
        quiz.setUpdatedAt(Instant.now());

        return quizRepository.save(quiz);
    }

    public void deleteQuiz(String id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + id));
        quizRepository.delete(quiz);
    }

    public QuizResultDto submitQuiz(String quizId, String userId, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        StudentProfile profile = studentProfileService.getProfileByUserId(userId);

        Map<Integer, Integer> answers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        List<QuizResultDto.QuestionReviewDto> reviews = new ArrayList<>();
        int score = 0;
        int total = quiz.getQuestions().size();

        for (Question q : quiz.getQuestions()) {
            Integer selectedOption = answers.get(q.getId());
            boolean correct = selectedOption != null && selectedOption.equals(q.getCorrectOptionIndex());

            if (correct) {
                score++;
            }

            reviews.add(new QuizResultDto.QuestionReviewDto(
                    q.getId(),
                    q.getQuestionText(),
                    q.getOptions(),
                    selectedOption,
                    q.getCorrectOptionIndex() != null ? q.getCorrectOptionIndex() : 0,
                    correct,
                    q.getExplanation()
            ));
        }

        double percentage = total > 0 ? ((double) score / total) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;
        boolean passed = percentage >= 60.0;

        // Persist quiz attempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quiz.getId());
        attempt.setQuizTitle(quiz.getTitle());
        attempt.setQuizCategory(quiz.getCategory());
        attempt.setUserId(userId);
        attempt.setStudentId(profile.getId());
        attempt.setAnswers(answers);
        attempt.setScore(score);
        attempt.setTotalQuestions(total);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        attempt.setAttemptedAt(Instant.now());
        quizAttemptRepository.save(attempt);

        // Build result
        QuizResultDto result = new QuizResultDto();
        result.setQuizId(quiz.getId());
        result.setQuizTitle(quiz.getTitle());
        result.setCategory(quiz.getCategory());
        result.setScore(score);
        result.setTotalQuestions(total);
        result.setPercentage(percentage);
        result.setPassed(passed);
        result.setReviews(reviews);

        return result;
    }

    public List<QuizAttempt> getMyQuizAttempts(String userId) {
        return quizAttemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);
    }
}
