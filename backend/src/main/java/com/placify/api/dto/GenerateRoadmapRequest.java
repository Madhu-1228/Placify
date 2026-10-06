package com.placify.api.dto;

public class GenerateRoadmapRequest {
    private String targetRole;
    private String targetDriveId;
    private int durationDays = 30;
    private boolean regenerate = false;

    public GenerateRoadmapRequest() {
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
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

    public boolean isRegenerate() {
        return regenerate;
    }

    public void setRegenerate(boolean regenerate) {
        this.regenerate = regenerate;
    }
}
