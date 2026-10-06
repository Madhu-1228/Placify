package com.placify.api.repository;

import com.placify.api.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserId(String userId);
    List<QuizAttempt> findByStudentId(String studentId);
    List<QuizAttempt> findByQuizId(String quizId);
    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(String userId);
}
