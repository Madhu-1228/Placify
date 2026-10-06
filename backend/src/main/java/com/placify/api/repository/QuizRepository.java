package com.placify.api.repository;

import com.placify.api.model.DifficultyLevel;
import com.placify.api.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCategory(String category);
    List<Quiz> findByDifficulty(DifficultyLevel difficulty);
    List<Quiz> findAllByOrderByCreatedAtDesc();
}
