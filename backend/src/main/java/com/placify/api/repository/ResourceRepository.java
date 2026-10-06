package com.placify.api.repository;

import com.placify.api.model.DifficultyLevel;
import com.placify.api.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByCategory(String category);
    List<Resource> findByDifficulty(DifficultyLevel difficulty);
    List<Resource> findByCategoryAndDifficulty(String category, DifficultyLevel difficulty);
    List<Resource> findAllByOrderByCreatedAtDesc();
}
