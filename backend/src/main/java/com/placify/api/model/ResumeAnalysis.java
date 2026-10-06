package com.placify.api.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "resume_analyses")
public class ResumeAnalysis {

    @Id
    private String id;

    private String userId;

    private String studentId;

    private String fileName;

    private Integer overallScore = 0; // 0 - 100

    private Integer atsScore = 0; // 0 - 100

    private List<String> detectedSkills = new ArrayList<>();

    private List<String> missingSkills = new ArrayList<>();

    private List<String> strengths = new ArrayList<>();

    private List<String> weaknesses = new ArrayList<>();

    private List<String> formattingSuggestions = new ArrayList<>();

    private List<String> projectSuggestions = new ArrayList<>();

    private String readinessVerdict; // e.g. "Placement Ready", "Moderate Readiness", "Needs Improvement"

    private String targetDriveId;

    private String analysisSource; // "GEMINI_AI" | "HEURISTIC_ENGINE"

    private Boolean isResume = true;

    private String rejectionReason;

    @CreatedDate
    private Instant createdAt;

    public ResumeAnalysis() {
    }

    // Getters and Setters
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(Integer atsScore) {
        this.atsScore = atsScore;
    }

    public List<String> getDetectedSkills() {
        return detectedSkills;
    }

    public void setDetectedSkills(List<String> detectedSkills) {
        this.detectedSkills = detectedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<String> getFormattingSuggestions() {
        return formattingSuggestions;
    }

    public void setFormattingSuggestions(List<String> formattingSuggestions) {
        this.formattingSuggestions = formattingSuggestions;
    }

    public List<String> getProjectSuggestions() {
        return projectSuggestions;
    }

    public void setProjectSuggestions(List<String> projectSuggestions) {
        this.projectSuggestions = projectSuggestions;
    }

    public String getReadinessVerdict() {
        return readinessVerdict;
    }

    public void setReadinessVerdict(String readinessVerdict) {
        this.readinessVerdict = readinessVerdict;
    }

    public String getTargetDriveId() {
        return targetDriveId;
    }

    public void setTargetDriveId(String targetDriveId) {
        this.targetDriveId = targetDriveId;
    }

    public String getAnalysisSource() {
        return analysisSource;
    }

    public void setAnalysisSource(String analysisSource) {
        this.analysisSource = analysisSource;
    }

    public Boolean getIsResume() {
        return isResume;
    }

    public void setIsResume(Boolean isResume) {
        this.isResume = isResume;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
