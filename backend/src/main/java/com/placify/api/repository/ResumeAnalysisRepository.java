package com.placify.api.repository;

import com.placify.api.model.ResumeAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {
    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ResumeAnalysis> findByStudentIdOrderByCreatedAtDesc(String studentId);
    Optional<ResumeAnalysis> findFirstByUserIdOrderByCreatedAtDesc(String userId);
    Optional<ResumeAnalysis> findTopByUserIdOrderByCreatedAtDesc(String userId);
}
