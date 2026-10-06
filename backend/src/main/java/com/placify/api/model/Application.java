package com.placify.api.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "applications")
@CompoundIndex(name = "student_drive_unique_idx", def = "{'studentId': 1, 'driveId': 1}", unique = true)
public class Application {

    @Id
    private String id;

    private String studentId;

    private String driveId;

    private String userId;

    private String studentName;

    private String studentRollNumber;

    private String studentDepartment;

    private String studentEmail;

    private String studentPhone;

    private String resumeUrl;

    private Double studentCgpa;

    private Integer studentBacklogs = 0;

    private String companyName;

    private String driveRole;

    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String notes;

    private List<StageHistory> stageHistory = new ArrayList<>();

    @CreatedDate
    private Instant appliedAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Application() {
    }

    public Application(String studentId, String driveId, String userId, String studentName, 
                       String studentRollNumber, String studentDepartment, String companyName, String driveRole) {
        this.studentId = studentId;
        this.driveId = driveId;
        this.userId = userId;
        this.studentName = studentName;
        this.studentRollNumber = studentRollNumber;
        this.studentDepartment = studentDepartment;
        this.companyName = companyName;
        this.driveRole = driveRole;
        this.status = ApplicationStatus.APPLIED;
        this.appliedAt = Instant.now();
        this.stageHistory.add(new StageHistory(ApplicationStatus.APPLIED, Instant.now(), studentName, "Application submitted successfully with candidate resume dossier."));
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDriveId() {
        return driveId;
    }

    public void setDriveId(String driveId) {
        this.driveId = driveId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public String getStudentDepartment() {
        return studentDepartment;
    }

    public void setStudentDepartment(String studentDepartment) {
        this.studentDepartment = studentDepartment;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentPhone() {
        return studentPhone;
    }

    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public Double getStudentCgpa() {
        return studentCgpa;
    }

    public void setStudentCgpa(Double studentCgpa) {
        this.studentCgpa = studentCgpa;
    }

    public Integer getStudentBacklogs() {
        return studentBacklogs;
    }

    public void setStudentBacklogs(Integer studentBacklogs) {
        this.studentBacklogs = studentBacklogs;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDriveRole() {
        return driveRole;
    }

    public void setDriveRole(String driveRole) {
        this.driveRole = driveRole;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<StageHistory> getStageHistory() {
        return stageHistory;
    }

    public void setStageHistory(List<StageHistory> stageHistory) {
        this.stageHistory = stageHistory;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
