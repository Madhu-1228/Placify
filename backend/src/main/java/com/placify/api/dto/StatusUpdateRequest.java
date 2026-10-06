package com.placify.api.dto;

import com.placify.api.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;

    private String notes;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(ApplicationStatus status, String notes) {
        this.status = status;
        this.notes = notes;
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
}
