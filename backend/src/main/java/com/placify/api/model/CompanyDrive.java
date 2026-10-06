package com.placify.api.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "company_drives")
public class CompanyDrive {

    @Id
    private String id;

    private String companyName;

    private String role;

    private String jobDescription;

    private String packageCtc;

    private String location;

    private String driveDate;

    private String applicationDeadline;

    private Double minimumCgpa = 0.0;

    private Integer maximumBacklogs = 0;

    private List<String> eligibleDepartments = new ArrayList<>();

    private List<Integer> eligibleYears = new ArrayList<>();

    private List<String> requiredSkills = new ArrayList<>();

    private List<String> selectionRounds = new ArrayList<>();

    private DriveStatus status = DriveStatus.OPEN;

    private String createdBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public CompanyDrive() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getPackageCtc() {
        return packageCtc;
    }

    public void setPackageCtc(String packageCtc) {
        this.packageCtc = packageCtc;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDriveDate() {
        return driveDate;
    }

    public void setDriveDate(String driveDate) {
        this.driveDate = driveDate;
    }

    public String getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(String applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public void setMinimumCgpa(Double minimumCgpa) {
        this.minimumCgpa = minimumCgpa;
    }

    public Integer getMaximumBacklogs() {
        return maximumBacklogs;
    }

    public void setMaximumBacklogs(Integer maximumBacklogs) {
        this.maximumBacklogs = maximumBacklogs;
    }

    public List<String> getEligibleDepartments() {
        return eligibleDepartments;
    }

    public void setEligibleDepartments(List<String> eligibleDepartments) {
        this.eligibleDepartments = eligibleDepartments;
    }

    public List<Integer> getEligibleYears() {
        return eligibleYears;
    }

    public void setEligibleYears(List<Integer> eligibleYears) {
        this.eligibleYears = eligibleYears;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getSelectionRounds() {
        return selectionRounds;
    }

    public void setSelectionRounds(List<String> selectionRounds) {
        this.selectionRounds = selectionRounds;
    }

    public DriveStatus getStatus() {
        return status;
    }

    public void setStatus(DriveStatus status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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
