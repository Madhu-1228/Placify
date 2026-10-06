package com.placify.api.dto;

import com.placify.api.model.DriveStatus;

import java.util.ArrayList;
import java.util.List;

public class DriveAnalyticsDto {

    private String driveId;
    private String companyName;
    private String role;
    private String packageCtc;
    private DriveStatus driveStatus;
    private String driveDate;
    private String applicationDeadline;

    // Student Pipeline Counts
    private long totalStudents;
    private long totalEligible;
    private long totalApplied;
    private long eligibleAndApplied;
    private long eligibleNotApplied;
    private long ineligibleCount;

    // Recruitment Stages Counts (from existing ApplicationStatus)
    private long underReviewCount;
    private long testCount;
    private long interviewCount;
    private long selectedCount;
    private long rejectedCount;

    // Calculated Conversion Percentages
    private double applicationRate; // (eligibleAndApplied / totalEligible) * 100
    private double selectionRate;   // (selectedCount / totalApplied) * 100

    // Academic Averages
    private double avgCgpaTotal;
    private double avgCgpaEligible;
    private double avgCgpaApplied;
    private double avgCgpaSelected;

    // Branch Breakdown
    private List<BranchDriveStat> branchStats = new ArrayList<>();

    public DriveAnalyticsDto() {
    }

    public static class BranchDriveStat {
        private String branch;
        private long eligibleCount;
        private long appliedCount;
        private long selectedCount;
        private double participationRate;

        public BranchDriveStat() {
        }

        public BranchDriveStat(String branch, long eligibleCount, long appliedCount, long selectedCount) {
            this.branch = branch;
            this.eligibleCount = eligibleCount;
            this.appliedCount = appliedCount;
            this.selectedCount = selectedCount;
            this.participationRate = eligibleCount > 0 ? Math.round((appliedCount * 100.0 / eligibleCount) * 10.0) / 10.0 : 0.0;
        }

        public String getBranch() {
            return branch;
        }

        public void setBranch(String branch) {
            this.branch = branch;
        }

        public long getEligibleCount() {
            return eligibleCount;
        }

        public void setEligibleCount(long eligibleCount) {
            this.eligibleCount = eligibleCount;
        }

        public long getAppliedCount() {
            return appliedCount;
        }

        public void setAppliedCount(long appliedCount) {
            this.appliedCount = appliedCount;
        }

        public long getSelectedCount() {
            return selectedCount;
        }

        public void setSelectedCount(long selectedCount) {
            this.selectedCount = selectedCount;
        }

        public double getParticipationRate() {
            return participationRate;
        }

        public void setParticipationRate(double participationRate) {
            this.participationRate = participationRate;
        }
    }

    // Getters and Setters
    public String getDriveId() {
        return driveId;
    }

    public void setDriveId(String driveId) {
        this.driveId = driveId;
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

    public String getPackageCtc() {
        return packageCtc;
    }

    public void setPackageCtc(String packageCtc) {
        this.packageCtc = packageCtc;
    }

    public DriveStatus getDriveStatus() {
        return driveStatus;
    }

    public void setDriveStatus(DriveStatus driveStatus) {
        this.driveStatus = driveStatus;
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

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalEligible() {
        return totalEligible;
    }

    public void setTotalEligible(long totalEligible) {
        this.totalEligible = totalEligible;
    }

    public long getTotalApplied() {
        return totalApplied;
    }

    public void setTotalApplied(long totalApplied) {
        this.totalApplied = totalApplied;
    }

    public long getEligibleAndApplied() {
        return eligibleAndApplied;
    }

    public void setEligibleAndApplied(long eligibleAndApplied) {
        this.eligibleAndApplied = eligibleAndApplied;
    }

    public long getEligibleNotApplied() {
        return eligibleNotApplied;
    }

    public void setEligibleNotApplied(long eligibleNotApplied) {
        this.eligibleNotApplied = eligibleNotApplied;
    }

    public long getIneligibleCount() {
        return ineligibleCount;
    }

    public void setIneligibleCount(long ineligibleCount) {
        this.ineligibleCount = ineligibleCount;
    }

    public long getUnderReviewCount() {
        return underReviewCount;
    }

    public void setUnderReviewCount(long underReviewCount) {
        this.underReviewCount = underReviewCount;
    }

    public long getTestCount() {
        return testCount;
    }

    public void setTestCount(long testCount) {
        this.testCount = testCount;
    }

    public long getInterviewCount() {
        return interviewCount;
    }

    public void setInterviewCount(long interviewCount) {
        this.interviewCount = interviewCount;
    }

    public long getSelectedCount() {
        return selectedCount;
    }

    public void setSelectedCount(long selectedCount) {
        this.selectedCount = selectedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public double getApplicationRate() {
        return applicationRate;
    }

    public void setApplicationRate(double applicationRate) {
        this.applicationRate = applicationRate;
    }

    public double getSelectionRate() {
        return selectionRate;
    }

    public void setSelectionRate(double selectionRate) {
        this.selectionRate = selectionRate;
    }

    public double getAvgCgpaTotal() {
        return avgCgpaTotal;
    }

    public void setAvgCgpaTotal(double avgCgpaTotal) {
        this.avgCgpaTotal = avgCgpaTotal;
    }

    public double getAvgCgpaEligible() {
        return avgCgpaEligible;
    }

    public void setAvgCgpaEligible(double avgCgpaEligible) {
        this.avgCgpaEligible = avgCgpaEligible;
    }

    public double getAvgCgpaApplied() {
        return avgCgpaApplied;
    }

    public void setAvgCgpaApplied(double avgCgpaApplied) {
        this.avgCgpaApplied = avgCgpaApplied;
    }

    public double getAvgCgpaSelected() {
        return avgCgpaSelected;
    }

    public void setAvgCgpaSelected(double avgCgpaSelected) {
        this.avgCgpaSelected = avgCgpaSelected;
    }

    public List<BranchDriveStat> getBranchStats() {
        return branchStats;
    }

    public void setBranchStats(List<BranchDriveStat> branchStats) {
        this.branchStats = branchStats;
    }
}
