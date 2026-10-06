package com.placify.api.service;

import com.placify.api.dto.ApplicationSubmitRequest;
import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.dto.StatusUpdateRequest;
import com.placify.api.exception.BadRequestException;
import com.placify.api.exception.DuplicateResourceException;
import com.placify.api.exception.EligibilityFailedException;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.*;
import com.placify.api.repository.ApplicationRepository;
import com.placify.api.util.EligibilityEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentProfileService studentProfileService;

    @Autowired
    private CompanyDriveService companyDriveService;

    @Autowired
    private EligibilityEngine eligibilityEngine;

    public Application applyForDrive(String userId, String driveId, ApplicationSubmitRequest formRequest) {
        StudentProfile student = studentProfileService.getProfileByUserId(userId);
        CompanyDrive drive = companyDriveService.getDriveById(driveId);

        if (drive.getStatus() == DriveStatus.CLOSED || drive.getStatus() == DriveStatus.COMPLETED) {
            throw new BadRequestException("This company drive is currently " + drive.getStatus() + " and no longer accepting applications.");
        }

        // Check if duplicate application
        if (applicationRepository.existsByStudentIdAndDriveId(student.getId(), driveId)) {
            throw new DuplicateResourceException("You have already submitted an application for " + drive.getCompanyName() + " (" + drive.getRole() + ").");
        }

        // Enforce Eligibility Check
        EligibilityResultDto eval = eligibilityEngine.evaluate(student, drive);
        if (!eval.isEligible()) {
            throw new EligibilityFailedException(
                    "You are not eligible to apply for " + drive.getCompanyName() + ". Please review the requirements.",
                    eval.getReasons()
            );
        }

        // Determine student details from form or fallback to student profile
        String name = (formRequest != null && StringUtils.hasText(formRequest.getStudentName())) ? formRequest.getStudentName().trim() : student.getName();
        String rollNumber = (formRequest != null && StringUtils.hasText(formRequest.getStudentRollNumber())) ? formRequest.getStudentRollNumber().trim() : (student.getRollNumber() != null ? student.getRollNumber() : "N/A");
        String department = (formRequest != null && StringUtils.hasText(formRequest.getStudentDepartment())) ? formRequest.getStudentDepartment().trim() : (student.getDepartment() != null ? student.getDepartment() : "General");
        String email = (formRequest != null && StringUtils.hasText(formRequest.getStudentEmail())) ? formRequest.getStudentEmail().trim() : student.getEmail();
        String phone = (formRequest != null && StringUtils.hasText(formRequest.getStudentPhone())) ? formRequest.getStudentPhone().trim() : student.getPhone();
        String resume = (formRequest != null && StringUtils.hasText(formRequest.getResumeUrl())) ? formRequest.getResumeUrl().trim() : student.getResumeUrl();
        Double cgpa = (formRequest != null && formRequest.getCgpa() != null) ? formRequest.getCgpa() : student.getCgpa();
        Integer backlogs = (formRequest != null && formRequest.getBacklogs() != null) ? formRequest.getBacklogs() : (student.getBacklogs() != null ? student.getBacklogs() : 0);
        String notes = (formRequest != null) ? formRequest.getNotes() : null;

        // Check that resume is correctly uploaded/attached
        if (!StringUtils.hasText(resume)) {
            throw new BadRequestException("Please upload or attach your resume/CV before submitting the application.");
        }

        // Create application
        Application app = new Application(
                student.getId(),
                drive.getId(),
                userId,
                name,
                rollNumber,
                department,
                drive.getCompanyName(),
                drive.getRole()
        );
        app.setStudentEmail(email);
        app.setStudentPhone(phone);
        app.setResumeUrl(resume);
        app.setStudentCgpa(cgpa);
        app.setStudentBacklogs(backlogs != null ? backlogs : 0);
        if (StringUtils.hasText(notes)) {
            app.setNotes(notes.trim());
        }
        app.setUpdatedAt(Instant.now());

        return applicationRepository.save(app);
    }

    public List<Application> getMyApplications(String userId) {
        return applicationRepository.findByUserId(userId);
    }

    public List<Application> getApplicationsForDrive(String driveId) {
        return applicationRepository.findByDriveId(driveId);
    }

    public List<Application> getAllApplications(ApplicationStatus status, String driveId) {
        List<Application> apps = applicationRepository.findAllByOrderByAppliedAtDesc();

        return apps.stream()
                .filter(a -> {
                    if (status != null && a.getStatus() != status) {
                        return false;
                    }
                    if (StringUtils.hasText(driveId) && !a.getDriveId().equals(driveId)) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Application updateApplicationStatus(String id, StatusUpdateRequest request, String updatedBy) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));

        app.setStatus(request.getStatus());
        if (StringUtils.hasText(request.getNotes())) {
            app.setNotes(request.getNotes().trim());
        }

        StageHistory history = new StageHistory(
                request.getStatus(),
                Instant.now(),
                updatedBy != null ? updatedBy : "Placement Cell Admin",
                request.getNotes() != null ? request.getNotes() : "Status updated to " + request.getStatus()
        );
        app.getStageHistory().add(history);
        app.setUpdatedAt(Instant.now());

        return applicationRepository.save(app);
    }
}
