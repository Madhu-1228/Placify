package com.placify.api.repository;

import com.placify.api.model.PreparationRoadmap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreparationRoadmapRepository extends MongoRepository<PreparationRoadmap, String> {
    Optional<PreparationRoadmap> findTopByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<PreparationRoadmap> findTopByStudentIdOrderByUpdatedAtDesc(String studentId);
    List<PreparationRoadmap> findByUserIdOrderByUpdatedAtDesc(String userId);
    void deleteByUserId(String userId);
}
