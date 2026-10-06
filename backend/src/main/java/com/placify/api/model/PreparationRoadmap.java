package com.placify.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "preparation_roadmaps")
public class PreparationRoadmap {

    @Id
    private String id;
    private String userId;
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String department;

    private String targetRole; // e.g. "Java Full Stack Developer"
    private String targetCompany; // e.g. "TCS Digital" or null if generic role
    private String targetDriveId;
    private int durationDays; // 7, 14, 30, 60

    private List<String> currentStrengths = new ArrayList<>();
    private List<SkillGap> skillGaps = new ArrayList<>();
    private List<RoadmapMilestone> milestones = new ArrayList<>();

    private int completionPercentage = 0;
    private int completedTasksCount = 0;
    private int totalTasksCount = 0;

    private String currentFocus;
    private String nextRecommendedActivity;
    private String adaptiveAdvice;

    private String generatedBy; // "GEMINI_AI" or "HEURISTIC_ENGINE"
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public PreparationRoadmap() {
    }

    public void recalculateMetrics() {
        int total = 0;
        int completed = 0;
        String firstIncompleteFocus = null;
        String firstIncompleteTaskTitle = null;

        if (milestones != null) {
            for (RoadmapMilestone m : milestones) {
                if (m.getTasks() != null) {
                    for (RoadmapTask t : m.getTasks()) {
                        total++;
                        if (t.getStatus() == TaskStatus.COMPLETED) {
                            completed++;
                        } else if (firstIncompleteFocus == null) {
                            firstIncompleteFocus = m.getFocusArea() != null ? m.getFocusArea() : m.getTitle();
                            firstIncompleteTaskTitle = t.getTitle();
                        }
                    }
                }
            }
        }

        this.totalTasksCount = total;
        this.completedTasksCount = completed;
        this.completionPercentage = total > 0 ? Math.round(((float) completed / total) * 100) : 0;
        
        if (firstIncompleteFocus != null) {
            this.currentFocus = firstIncompleteFocus;
            this.nextRecommendedActivity = firstIncompleteTaskTitle;
        } else if (total > 0 && completed == total) {
            this.currentFocus = "Placement Mastery Achieved";
            this.nextRecommendedActivity = "Review Mock Interview Scenarios";
            this.adaptiveAdvice = "Outstanding work! You have completed 100% of your personalized roadmap milestones.";
        }
        
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetCompany() {
        return targetCompany;
    }

    public void setTargetCompany(String targetCompany) {
        this.targetCompany = targetCompany;
    }

    public String getTargetDriveId() {
        return targetDriveId;
    }

    public void setTargetDriveId(String targetDriveId) {
        this.targetDriveId = targetDriveId;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public List<String> getCurrentStrengths() {
        return currentStrengths;
    }

    public void setCurrentStrengths(List<String> currentStrengths) {
        this.currentStrengths = currentStrengths;
    }

    public List<SkillGap> getSkillGaps() {
        return skillGaps;
    }

    public void setSkillGaps(List<SkillGap> skillGaps) {
        this.skillGaps = skillGaps;
    }

    public List<RoadmapMilestone> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<RoadmapMilestone> milestones) {
        this.milestones = milestones;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public int getCompletedTasksCount() {
        return completedTasksCount;
    }

    public void setCompletedTasksCount(int completedTasksCount) {
        this.completedTasksCount = completedTasksCount;
    }

    public int getTotalTasksCount() {
        return totalTasksCount;
    }

    public void setTotalTasksCount(int totalTasksCount) {
        this.totalTasksCount = totalTasksCount;
    }

    public String getCurrentFocus() {
        return currentFocus;
    }

    public void setCurrentFocus(String currentFocus) {
        this.currentFocus = currentFocus;
    }

    public String getNextRecommendedActivity() {
        return nextRecommendedActivity;
    }

    public void setNextRecommendedActivity(String nextRecommendedActivity) {
        this.nextRecommendedActivity = nextRecommendedActivity;
    }

    public String getAdaptiveAdvice() {
        return adaptiveAdvice;
    }

    public void setAdaptiveAdvice(String adaptiveAdvice) {
        this.adaptiveAdvice = adaptiveAdvice;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
