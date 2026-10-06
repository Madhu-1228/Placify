package com.placify.api.dto;

import com.placify.api.model.DriveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class CompanyDriveRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    @NotBlank(message = "Package / CTC is required")
    private String packageCtc;

    private String location;

    @NotBlank(message = "Drive date is required")
    private String driveDate;

    @NotBlank(message = "Application deadline is required")
    private String applicationDeadline;

    @NotNull(message = "Minimum CGPA is required")
    private Double minimumCgpa = 0.0;

    @NotNull(message = "Maximum backlogs allowed is required")
    private Integer maximumBacklogs = 0;

    private List<String> eligibleDepartments = new ArrayList<>();

    private List<Integer> eligibleYears = new ArrayList<>();

    private List<String> requiredSkills = new ArrayList<>();

    private List<String> selectionRounds = new ArrayList<>();

    private DriveStatus status = DriveStatus.OPEN;

    public CompanyDriveRequest() {
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
}
