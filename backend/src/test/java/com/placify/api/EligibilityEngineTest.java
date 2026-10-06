package com.placify.api;

import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.StudentProfile;
import com.placify.api.util.EligibilityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EligibilityEngineTest {

    private EligibilityEngine eligibilityEngine;

    @BeforeEach
    public void setUp() {
        eligibilityEngine = new EligibilityEngine();
    }

    @Test
    public void testEligibleStudentPassesAllCriteria() {
        StudentProfile student = new StudentProfile("user123", "Rahul Sharma", "rahul@placify.edu");
        student.setCgpa(8.5);
        student.setBacklogs(0);
        student.setDepartment("Computer Science and Engineering");
        student.setYear(4);
        student.setSkills(Arrays.asList("Java", "Spring Boot", "React", "SQL", "DSA"));

        CompanyDrive drive = new CompanyDrive();
        drive.setMinimumCgpa(7.5);
        drive.setMaximumBacklogs(0);
        drive.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology"));
        drive.setEligibleYears(List.of(4));
        drive.setRequiredSkills(Arrays.asList("Java", "SQL"));

        EligibilityResultDto result = eligibilityEngine.evaluate(student, drive);

        assertTrue(result.isEligible(), "Student with 8.5 CGPA, 0 backlogs and matching branch must be eligible");
        assertTrue(result.getReasons().isEmpty(), "No failure reasons should be present");
        assertTrue(result.getMatchPercentage() >= 90.0, "Match percentage should be high");
    }

    @Test
    public void testIneligibleStudentDueToLowCgpaAndBacklogs() {
        StudentProfile student = new StudentProfile("user456", "Amit Kumar", "amit@placify.edu");
        student.setCgpa(6.8);
        student.setBacklogs(2);
        student.setDepartment("Mechanical Engineering");
        student.setYear(3);
        student.setSkills(List.of("AutoCAD"));

        CompanyDrive drive = new CompanyDrive();
        drive.setMinimumCgpa(7.5);
        drive.setMaximumBacklogs(0);
        drive.setEligibleDepartments(List.of("Computer Science and Engineering"));
        drive.setEligibleYears(List.of(4));
        drive.setRequiredSkills(Arrays.asList("Java", "SQL"));

        EligibilityResultDto result = eligibilityEngine.evaluate(student, drive);

        assertFalse(result.isEligible(), "Student failing CGPA, backlogs, department, and year must be ineligible");
        assertEquals(4, result.getReasons().size(), "Should list 4 clear failure reasons");
        assertEquals(2, result.getMissingSkills().size(), "Should identify both Java and SQL as missing");
    }
}
