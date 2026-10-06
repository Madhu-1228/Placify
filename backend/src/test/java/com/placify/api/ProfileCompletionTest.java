package com.placify.api;

import com.placify.api.model.Certification;
import com.placify.api.model.Project;
import com.placify.api.model.StudentProfile;
import com.placify.api.service.StudentProfileService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ProfileCompletionTest {

    @Test
    public void testDynamicProfileCompletionCalculation() {
        StudentProfileService service = new StudentProfileService();

        StudentProfile initialProfile = new StudentProfile("u1", "Student", "student@test.com");
        int initialScore = service.calculateCompletion(initialProfile);
        assertTrue(initialScore >= 10 && initialScore <= 20, "Initial profile with name/email should score baseline completion");

        StudentProfile fullProfile = new StudentProfile("u2", "Rahul Sharma", "rahul@test.com");
        fullProfile.setRollNumber("21CS101");
        fullProfile.setDepartment("Computer Science and Engineering");
        fullProfile.setPhone("+919876543210");
        fullProfile.setYear(4);
        fullProfile.setSemester(8);
        fullProfile.setCgpa(8.8);
        fullProfile.setBacklogs(0);
        fullProfile.setSkills(List.of("Java", "React", "MongoDB"));
        fullProfile.setProjects(List.of(new Project("Placify", "Placement portal", "Java, React", "http://github.com/placify")));
        fullProfile.setCertifications(List.of(new Certification("AWS Certified", "Amazon", "2025", "http://cert.com")));
        fullProfile.setResumeUrl("/uploads/resumes/resume.pdf");

        int fullScore = service.calculateCompletion(fullProfile);
        assertEquals(100, fullScore, "Completely filled profile must score 100%");
    }
}
