package com.placify.api.repository;

import com.placify.api.model.StudentProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends MongoRepository<StudentProfile, String> {
    Optional<StudentProfile> findByUserId(String userId);
    Optional<StudentProfile> findByEmail(String email);
    Optional<StudentProfile> findByRollNumber(String rollNumber);
    Boolean existsByRollNumber(String rollNumber);
    List<StudentProfile> findByDepartment(String department);
    List<StudentProfile> findByYear(Integer year);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } }, { 'rollNumber': { '$regex': ?0, '$options': 'i' } } ] }")
    List<StudentProfile> searchStudents(String query);
}
