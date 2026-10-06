package com.placify.api.service;

import com.placify.api.dto.CompanyDriveRequest;
import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.DriveStatus;
import com.placify.api.model.StudentProfile;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.util.EligibilityEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompanyDriveService {

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private StudentProfileService studentProfileService;

    @Autowired
    private EligibilityEngine eligibilityEngine;

    public List<CompanyDrive> getAllDrives(DriveStatus status, String search) {
        List<CompanyDrive> drives = companyDriveRepository.findAllByOrderByCreatedAtDesc();

        return drives.stream()
                .filter(d -> {
                    if (status != null && d.getStatus() != status) {
                        return false;
                    }
                    if (StringUtils.hasText(search)) {
                        String s = search.toLowerCase();
                        boolean matchCompany = d.getCompanyName() != null && d.getCompanyName().toLowerCase().contains(s);
                        boolean matchRole = d.getRole() != null && d.getRole().toLowerCase().contains(s);
                        boolean matchLocation = d.getLocation() != null && d.getLocation().toLowerCase().contains(s);
                        return matchCompany || matchRole || matchLocation;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public CompanyDrive getDriveById(String id) {
        return companyDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company drive not found: " + id));
    }

    public List<Map<String, Object>> getEligibleDrivesForStudent(String userId) {
        StudentProfile student = studentProfileService.getProfileByUserId(userId);
        List<CompanyDrive> drives = companyDriveRepository.findAllByOrderByCreatedAtDesc();

        return drives.stream()
                .map(drive -> {
                    EligibilityResultDto eval = eligibilityEngine.evaluate(student, drive);
                    Map<String, Object> item = new HashMap<>();
                    item.put("drive", drive);
                    item.put("eligibility", eval);
                    return item;
                })
                .collect(Collectors.toList());
    }

    public EligibilityResultDto checkEligibilityForDrive(String userId, String driveId) {
        StudentProfile student = studentProfileService.getProfileByUserId(userId);
        CompanyDrive drive = getDriveById(driveId);
        return eligibilityEngine.evaluate(student, drive);
    }

    public CompanyDrive createDrive(CompanyDriveRequest request, String createdBy) {
        CompanyDrive drive = new CompanyDrive();
        copyProperties(request, drive);
        drive.setCreatedBy(createdBy);
        drive.setCreatedAt(Instant.now());
        drive.setUpdatedAt(Instant.now());
        return companyDriveRepository.save(drive);
    }

    public CompanyDrive updateDrive(String id, CompanyDriveRequest request) {
        CompanyDrive drive = getDriveById(id);
        copyProperties(request, drive);
        drive.setUpdatedAt(Instant.now());
        return companyDriveRepository.save(drive);
    }

    public void deleteDrive(String id) {
        CompanyDrive drive = getDriveById(id);
        companyDriveRepository.delete(drive);
    }

    public CompanyDrive updateDriveStatus(String id, DriveStatus status) {
        CompanyDrive drive = getDriveById(id);
        drive.setStatus(status);
        drive.setUpdatedAt(Instant.now());
        return companyDriveRepository.save(drive);
    }

    private void copyProperties(CompanyDriveRequest req, CompanyDrive drive) {
        drive.setCompanyName(req.getCompanyName().trim());
        drive.setRole(req.getRole().trim());
        drive.setJobDescription(req.getJobDescription().trim());
        drive.setPackageCtc(req.getPackageCtc().trim());
        drive.setLocation(req.getLocation() != null ? req.getLocation().trim() : "Flexible / Hybrid");
        drive.setDriveDate(req.getDriveDate());
        drive.setApplicationDeadline(req.getApplicationDeadline());
        drive.setMinimumCgpa(req.getMinimumCgpa() != null ? req.getMinimumCgpa() : 0.0);
        drive.setMaximumBacklogs(req.getMaximumBacklogs() != null ? req.getMaximumBacklogs() : 0);
        drive.setEligibleDepartments(req.getEligibleDepartments());
        drive.setEligibleYears(req.getEligibleYears());
        drive.setRequiredSkills(req.getRequiredSkills());
        drive.setSelectionRounds(req.getSelectionRounds());
        if (req.getStatus() != null) {
            drive.setStatus(req.getStatus());
        }
    }
}
