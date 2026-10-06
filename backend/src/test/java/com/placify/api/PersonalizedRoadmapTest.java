package com.placify.api;

import com.placify.api.model.*;
import com.placify.api.repository.PreparationRoadmapRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import com.placify.api.service.RoadmapService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PersonalizedRoadmapTest {

    @Autowired
    private RoadmapService roadmapService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private PreparationRoadmapRepository roadmapRepository;

    @Test
    @DisplayName("Should generate a personalized roadmap with real student context and skill gaps")
    void testRoadmapGeneration() {
        // Find existing student demo user
        User user = userRepository.findByUsername("MadhuD")
                .orElse(userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).findFirst().orElse(null));

        assertNotNull(user, "Student user should exist");

        PreparationRoadmap roadmap = roadmapService.generateRoadmap(
                user.getId(),
                "Java Full Stack Developer",
                null,
                30,
                true
        );

        assertNotNull(roadmap, "Roadmap should not be null");
        assertNotNull(roadmap.getId(), "Roadmap ID should be persisted");
        assertEquals(user.getId(), roadmap.getUserId());
        assertEquals("Java Full Stack Developer", roadmap.getTargetRole());
        assertEquals(30, roadmap.getDurationDays());

        assertNotNull(roadmap.getSkillGaps(), "Skill gaps should be identified");
        assertFalse(roadmap.getSkillGaps().isEmpty(), "Skill gaps should not be empty");

        assertNotNull(roadmap.getMilestones(), "Milestones should be generated");
        assertFalse(roadmap.getMilestones().isEmpty(), "Milestones should not be empty");

        // Verify milestone structure
        for (RoadmapMilestone m : roadmap.getMilestones()) {
            assertNotNull(m.getTitle());
            assertNotNull(m.getFocusArea());
            assertNotNull(m.getTasks());
            for (RoadmapTask t : m.getTasks()) {
                assertNotNull(t.getId());
                assertNotNull(t.getTitle());
                assertEquals(TaskStatus.NOT_STARTED, t.getStatus());
            }
        }

        assertEquals(0, roadmap.getCompletionPercentage());
        assertNotNull(roadmap.getCurrentFocus());
    }

    @Test
    @DisplayName("Should correctly track task completion and recalculate metrics")
    void testTaskCompletionTracking() {
        User user = userRepository.findByUsername("MadhuD")
                .orElse(userRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).findFirst().orElse(null));

        assertNotNull(user, "Student user should exist");

        PreparationRoadmap roadmap = roadmapService.generateRoadmap(
                user.getId(),
                "Backend Software Engineer (Java / Spring Boot)",
                null,
                14,
                true
        );

        assertNotNull(roadmap);
        assertTrue(roadmap.getTotalTasksCount() > 0);

        // Pick first task and mark it COMPLETED
        RoadmapTask firstTask = roadmap.getMilestones().get(0).getTasks().get(0);
        PreparationRoadmap updated = roadmapService.updateTaskStatus(
                user.getId(),
                roadmap.getId(),
                firstTask.getId(),
                TaskStatus.COMPLETED
        );

        assertEquals(1, updated.getCompletedTasksCount());
        assertTrue(updated.getCompletionPercentage() > 0);
    }
}
