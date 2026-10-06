package com.placify.api.repository;

import com.placify.api.model.Application;
import com.placify.api.model.ApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByStudentId(String studentId);
    List<Application> findByUserId(String userId);
    List<Application> findByDriveId(String driveId);
    Optional<Application> findByStudentIdAndDriveId(String studentId, String driveId);
    Boolean existsByStudentIdAndDriveId(String studentId, String driveId);
    long countByStatus(ApplicationStatus status);
    long countByDriveId(String driveId);
    List<Application> findAllByOrderByAppliedAtDesc();
}
