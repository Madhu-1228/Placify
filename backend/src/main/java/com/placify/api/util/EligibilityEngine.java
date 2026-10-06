package com.placify.api.util;

import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.StudentProfile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EligibilityEngine {

    public EligibilityResultDto evaluate(StudentProfile student, CompanyDrive drive) {
        List<String> reasons = new ArrayList<>();
        List<String> passedCriteria = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        int totalCriteria = 4;
        int passedCount = 0;

        // 1. CGPA Criterion
        double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        double minCgpa = drive.getMinimumCgpa() != null ? drive.getMinimumCgpa() : 0.0;

        if (minCgpa > 0) {
            if (studentCgpa >= minCgpa) {
                passedCriteria.add(String.format("CGPA Requirement Met (Your CGPA: %.2f, Min: %.2f)", studentCgpa, minCgpa));
                passedCount++;
            } else {
                reasons.add(String.format("Minimum CGPA required is %.2f, but your current CGPA is %.2f", minCgpa, studentCgpa));
            }
        } else {
            passedCriteria.add("No CGPA restrictions");
            passedCount++;
        }

        // 2. Backlog Criterion
        int studentBacklogs = student.getBacklogs() != null ? student.getBacklogs() : 0;
        int maxBacklogs = drive.getMaximumBacklogs() != null ? drive.getMaximumBacklogs() : 0;

        if (studentBacklogs <= maxBacklogs) {
            passedCriteria.add(String.format("Backlog Limit Met (Active: %d, Max Allowed: %d)", studentBacklogs, maxBacklogs));
            passedCount++;
        } else {
            reasons.add(String.format("Active backlogs (%d) exceed maximum permitted limit of %d", studentBacklogs, maxBacklogs));
        }

        // 3. Department Criterion
        List<String> allowedDepts = drive.getEligibleDepartments();
        if (allowedDepts != null && !allowedDepts.isEmpty() && !allowedDepts.contains("ALL")) {
            String studentDept = student.getDepartment();
            if (StringUtils.hasText(studentDept) && allowedDepts.stream().anyMatch(d -> d.equalsIgnoreCase(studentDept))) {
                passedCriteria.add("Eligible Department: " + studentDept);
                passedCount++;
            } else {
                String deptDisplay = StringUtils.hasText(studentDept) ? studentDept : "Not specified in profile";
                reasons.add(String.format("Department '%s' is not in the eligible list: %s", deptDisplay, String.join(", ", allowedDepts)));
            }
        } else {
            passedCriteria.add("Open to all departments");
            passedCount++;
        }

        // 4. Year of Study Criterion
        List<Integer> allowedYears = drive.getEligibleYears();
        if (allowedYears != null && !allowedYears.isEmpty()) {
            Integer studentYear = student.getYear();
            if (studentYear != null && allowedYears.contains(studentYear)) {
                passedCriteria.add("Eligible Year: Year " + studentYear);
                passedCount++;
            } else {
                String yearDisplay = studentYear != null ? "Year " + studentYear : "Not specified in profile";
                reasons.add(String.format("Study year '%s' is not eligible for this drive", yearDisplay));
            }
        } else {
            passedCriteria.add("Open to all academic years");
            passedCount++;
        }

        // 5. Skill Gap Analysis
        List<String> requiredSkills = drive.getRequiredSkills();
        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            Set<String> studentSkillSet = new HashSet<>();
            if (student.getSkills() != null) {
                studentSkillSet = student.getSkills().stream()
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet());
            }

            for (String req : requiredSkills) {
                if (StringUtils.hasText(req)) {
                    String normReq = req.trim().toLowerCase();
                    boolean matched = studentSkillSet.stream().anyMatch(s -> s.contains(normReq) || normReq.contains(s));
                    if (!matched) {
                        missingSkills.add(req.trim());
                    }
                }
            }
        }

        boolean eligible = reasons.isEmpty();
        double basePercentage = ((double) passedCount / totalCriteria) * 80.0;
        double skillBonus = 0.0;
        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            int matchedSkillCount = requiredSkills.size() - missingSkills.size();
            skillBonus = ((double) matchedSkillCount / requiredSkills.size()) * 20.0;
        } else {
            skillBonus = 20.0;
        }

        double matchPercentage = Math.round((basePercentage + skillBonus) * 10.0) / 10.0;

        return new EligibilityResultDto(
                eligible,
                matchPercentage,
                reasons,
                passedCriteria,
                missingSkills,
                drive.getId(),
                drive.getCompanyName(),
                drive.getRole()
        );
    }
}
