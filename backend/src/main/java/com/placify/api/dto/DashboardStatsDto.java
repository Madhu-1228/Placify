package com.placify.api.dto;

import java.util.HashMap;
import java.util.Map;

public class DashboardStatsDto {

    private long totalStudents;
    private long activeStudents;
    private long totalDrives;
    private long activeDrives;
    private long totalApplications;
    private long selectedStudents;
    private double placementPercentage;

    private Map<String, Long> statusDistribution = new HashMap<>();
    private Map<String, Long> departmentWisePlacements = new HashMap<>();
    private Map<String, Long> drivesByStatus = new HashMap<>();

    public DashboardStatsDto() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(long activeStudents) {
        this.activeStudents = activeStudents;
    }

    public long getTotalDrives() {
        return totalDrives;
    }

    public void setTotalDrives(long totalDrives) {
        this.totalDrives = totalDrives;
    }

    public long getActiveDrives() {
        return activeDrives;
    }

    public void setActiveDrives(long activeDrives) {
        this.activeDrives = activeDrives;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getSelectedStudents() {
        return selectedStudents;
    }

    public void setSelectedStudents(long selectedStudents) {
        this.selectedStudents = selectedStudents;
    }

    public double getPlacementPercentage() {
        return placementPercentage;
    }

    public void setPlacementPercentage(double placementPercentage) {
        this.placementPercentage = placementPercentage;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getDepartmentWisePlacements() {
        return departmentWisePlacements;
    }

    public void setDepartmentWisePlacements(Map<String, Long> departmentWisePlacements) {
        this.departmentWisePlacements = departmentWisePlacements;
    }

    public Map<String, Long> getDrivesByStatus() {
        return drivesByStatus;
    }

    public void setDrivesByStatus(Map<String, Long> drivesByStatus) {
        this.drivesByStatus = drivesByStatus;
    }
}
