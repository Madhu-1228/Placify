package com.placify.api.service;

import com.placify.api.dto.StudentProfileDto;
import com.placify.api.exception.DuplicateResourceException;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.Application;
import com.placify.api.model.StudentProfile;
import com.placify.api.model.User;
import com.placify.api.repository.ApplicationRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class StudentProfileService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public StudentProfile getProfileByUserId(String userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    StudentProfile newProfile = new StudentProfile(user.getId(), user.getName(), user.getEmail());
                    newProfile.setCreatedAt(Instant.now());
                    newProfile.setUpdatedAt(Instant.now());
                    return studentProfileRepository.save(newProfile);
                });
    }

    public StudentProfile updateProfile(String userId, StudentProfileDto dto) {
        StudentProfile profile = getProfileByUserId(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // 1. Validate & update Roll Number
        if (StringUtils.hasText(dto.getRollNumber())) {
            String roll = dto.getRollNumber().trim().toUpperCase();
            Optional<StudentProfile> existingWithRoll = studentProfileRepository.findByRollNumber(roll);
            if (existingWithRoll.isPresent() && !existingWithRoll.get().getId().equals(profile.getId())) {
                throw new DuplicateResourceException("Roll number " + roll + " is already registered with another student.");
            }
            profile.setRollNumber(roll);
        }

        // 2. Update Personal Information
        if (StringUtils.hasText(dto.getName())) {
            String newName = dto.getName().trim();
            profile.setName(newName);
            user.setName(newName);
        }
        if (StringUtils.hasText(dto.getEmail())) {
            String newEmail = dto.getEmail().trim().toLowerCase();
            profile.setEmail(newEmail);
            user.setEmail(newEmail);
        }
        if (StringUtils.hasText(dto.getPhone())) {
            profile.setPhone(dto.getPhone().trim());
        }

        // 3. Update Academic Information
        if (StringUtils.hasText(dto.getDepartment())) {
            profile.setDepartment(dto.getDepartment().trim());
        }
        if (StringUtils.hasText(dto.getSection())) {
            profile.setSection(dto.getSection().trim().toUpperCase());
        }
        if (dto.getYear() != null) {
            profile.setYear(dto.getYear());
        }
        if (dto.getSemester() != null) {
            profile.setSemester(dto.getSemester());
        }
        if (dto.getCgpa() != null) {
            profile.setCgpa(dto.getCgpa());
        }
        if (dto.getBacklogs() != null) {
            profile.setBacklogs(dto.getBacklogs());
        }

        // 4. Update Technical Portfolio, Resume & Social Links
        if (dto.getSkills() != null) {
            profile.setSkills(dto.getSkills());
        }
        if (dto.getCertifications() != null) {
            profile.setCertifications(dto.getCertifications());
        }
        if (dto.getProjects() != null) {
            profile.setProjects(dto.getProjects());
        }
        if (StringUtils.hasText(dto.getResumeUrl())) {
            profile.setResumeUrl(dto.getResumeUrl().trim());
        }
        if (StringUtils.hasText(dto.getLinkedinUrl())) {
            profile.setLinkedinUrl(dto.getLinkedinUrl().trim());
        }
        if (StringUtils.hasText(dto.getGithubUrl())) {
            profile.setGithubUrl(dto.getGithubUrl().trim());
        }

        // Calculate actual completion percentage dynamically
        profile.setProfileCompletionPercentage(calculateCompletion(profile));
        profile.setUpdatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        // Save User & Profile
        userRepository.save(user);
        StudentProfile savedProfile = studentProfileRepository.save(profile);

        // 5. Synchronize changes to any existing applications in the admin pipeline
        try {
            List<Application> studentApps = applicationRepository.findByUserId(userId);
            for (Application app : studentApps) {
                app.setStudentName(savedProfile.getName());
                app.setStudentRollNumber(savedProfile.getRollNumber());
                app.setStudentDepartment(savedProfile.getDepartment());
                app.setStudentEmail(savedProfile.getEmail());
                app.setStudentPhone(savedProfile.getPhone());
                app.setStudentCgpa(savedProfile.getCgpa());
                if (StringUtils.hasText(savedProfile.getResumeUrl())) {
                    app.setResumeUrl(savedProfile.getResumeUrl());
                }
                app.setUpdatedAt(Instant.now());
                applicationRepository.save(app);
            }
        } catch (Exception e) {
            // Non-blocking sync
        }

        return savedProfile;
    }

    public int calculateCompletion(StudentProfile p) {
        int score = 0;
        // 1. Basic information (25 pts)
        if (StringUtils.hasText(p.getName())) score += 5;
        if (StringUtils.hasText(p.getEmail())) score += 5;
        if (StringUtils.hasText(p.getRollNumber())) score += 5;
        if (StringUtils.hasText(p.getDepartment())) score += 5;
        if (StringUtils.hasText(p.getPhone())) score += 5;

        // 2. Academic metrics (25 pts)
        if (p.getYear() != null && p.getYear() > 0) score += 5;
        if (p.getSemester() != null && p.getSemester() > 0) score += 5;
        if (p.getCgpa() != null && p.getCgpa() > 0.0) score += 10;
        if (p.getBacklogs() != null) score += 5;

        // 3. Technical Skills (15 pts)
        if (p.getSkills() != null && !p.getSkills().isEmpty()) score += 15;

        // 4. Projects (15 pts)
        if (p.getProjects() != null && !p.getProjects().isEmpty()) score += 15;

        // 5. Certifications (10 pts)
        if (p.getCertifications() != null && !p.getCertifications().isEmpty()) score += 10;

        // 6. Resume / Portfolio links (10 pts)
        if (StringUtils.hasText(p.getResumeUrl()) || StringUtils.hasText(p.getLinkedinUrl()) || StringUtils.hasText(p.getGithubUrl())) {
            score += 10;
        }

        return Math.min(100, score);
    }
}
