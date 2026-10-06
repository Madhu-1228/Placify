package com.placify.api.service;

import com.placify.api.dto.StudentCreateRequest;
import com.placify.api.exception.DuplicateResourceException;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.Role;
import com.placify.api.model.StudentProfile;
import com.placify.api.model.User;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminStudentService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<StudentProfile> getAllStudents(String search, String department, Integer year, Double minCgpa, Integer maxBacklogs) {
        List<StudentProfile> list;

        if (StringUtils.hasText(search)) {
            list = studentProfileRepository.searchStudents(search.trim());
        } else {
            list = studentProfileRepository.findAll();
        }

        return list.stream()
                .filter(s -> {
                    if (StringUtils.hasText(department) && !department.equalsIgnoreCase("ALL")) {
                        if (s.getDepartment() == null || !s.getDepartment().equalsIgnoreCase(department)) {
                            return false;
                        }
                    }
                    if (year != null && year > 0) {
                        if (s.getYear() == null || !s.getYear().equals(year)) {
                            return false;
                        }
                    }
                    if (minCgpa != null && minCgpa > 0.0) {
                        if (s.getCgpa() == null || s.getCgpa() < minCgpa) {
                            return false;
                        }
                    }
                    if (maxBacklogs != null) {
                        if (s.getBacklogs() == null || s.getBacklogs() > maxBacklogs) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public StudentProfile createStudent(StudentCreateRequest req) {
        String roll = req.getRollNumber() != null ? req.getRollNumber().trim().toUpperCase() : "";
        if (!StringUtils.hasText(roll)) {
            throw new IllegalArgumentException("Roll Number is required.");
        }

        String email = StringUtils.hasText(req.getEmail()) ? req.getEmail().trim().toLowerCase() : roll.toLowerCase() + "@vvit.net";

        if (studentProfileRepository.findByRollNumber(roll).isPresent()) {
            throw new DuplicateResourceException("A student with Roll Number " + roll + " already exists in the candidate registry.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with email " + email + " already exists.");
        }

        String rawPassword = StringUtils.hasText(req.getPassword()) ? req.getPassword() : "Student@1234";

        User user = new User(
                req.getName() != null ? req.getName().trim() : "Student " + roll,
                email,
                roll,
                passwordEncoder.encode(rawPassword),
                Role.STUDENT
        );
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(savedUser.getId(), user.getName(), user.getEmail());
        profile.setRollNumber(roll);
        profile.setDepartment(req.getDepartment() != null ? req.getDepartment().trim() : "Information Technology");
        profile.setSection(req.getSection() != null ? req.getSection().trim().toUpperCase() : "A");
        profile.setYear(req.getYear() != null ? req.getYear() : 3);
        profile.setSemester(req.getSemester() != null ? req.getSemester() : 6);
        profile.setCgpa(req.getCgpa() != null ? req.getCgpa() : 8.0);
        profile.setBacklogs(req.getBacklogs() != null ? req.getBacklogs() : 0);
        profile.setPhone(req.getPhone() != null ? req.getPhone().trim() : "+91 98765 43210");
        profile.setSkills(req.getSkills() != null ? req.getSkills() : List.of());
        profile.setResumeUrl(StringUtils.hasText(req.getResumeUrl()) ? req.getResumeUrl().trim() : "/uploads/resumes/" + roll + "_Resume.pdf");
        profile.setLinkedinUrl("https://linkedin.com/in/" + roll.toLowerCase());
        profile.setGithubUrl("https://github.com/" + roll.toLowerCase());

        int completion = (int) Math.min(100, Math.round(75 + ((profile.getCgpa() != null ? profile.getCgpa() : 8.0) * 2.5)));
        profile.setProfileCompletionPercentage(completion);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());

        return studentProfileRepository.save(profile);
    }

    public Map<String, Object> getStudentDetail(String profileId) {
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + profileId));

        User user = userRepository.findById(profile.getUserId()).orElse(null);

        Map<String, Object> result = new HashMap<>();
        result.put("profile", profile);
        result.put("accountActive", user != null && user.isActive());
        result.put("registeredAt", user != null ? user.getCreatedAt() : profile.getCreatedAt());
        return result;
    }

    public void setStudentAccountStatus(String profileId, boolean active) {
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + profileId));

        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for profile: " + profileId));

        user.setActive(active);
        userRepository.save(user);
    }
}
