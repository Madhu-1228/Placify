package com.placify.api.model;

import java.time.Instant;

public class StageHistory {
    private ApplicationStatus status;
    private Instant timestamp;
    private String updatedBy;
    private String notes;

    public StageHistory() {
    }

    public StageHistory(ApplicationStatus status, Instant timestamp, String updatedBy, String notes) {
        this.status = status;
        this.timestamp = timestamp;
        this.updatedBy = updatedBy;
        this.notes = notes;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
