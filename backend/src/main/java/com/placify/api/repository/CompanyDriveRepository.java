package com.placify.api.repository;

import com.placify.api.model.CompanyDrive;
import com.placify.api.model.DriveStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyDriveRepository extends MongoRepository<CompanyDrive, String> {
    List<CompanyDrive> findByStatus(DriveStatus status);
    long countByStatus(DriveStatus status);
    List<CompanyDrive> findAllByOrderByCreatedAtDesc();
    boolean existsByCompanyNameIgnoreCase(String companyName);
}
