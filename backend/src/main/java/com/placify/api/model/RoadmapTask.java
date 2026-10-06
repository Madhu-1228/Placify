package com.placify.api.model;

import java.util.UUID;

public class RoadmapTask {
    private String id;
    private String title;
    private String description;
    private String type; // "CONCEPT", "PRACTICE", "PROJECT", "INTERVIEW", "ASSESSMENT"
    private TaskStatus status;
    private String resourceTitle;
    private String resourceLink;
    private Integer estimatedMinutes;

    public RoadmapTask() {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.status = TaskStatus.NOT_STARTED;
    }

    public RoadmapTask(String title, String description, String type, String resourceTitle, String resourceLink, Integer estimatedMinutes) {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = TaskStatus.NOT_STARTED;
        this.resourceTitle = resourceTitle;
        this.resourceLink = resourceLink;
        this.estimatedMinutes = estimatedMinutes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getResourceTitle() {
        return resourceTitle;
    }

    public void setResourceTitle(String resourceTitle) {
        this.resourceTitle = resourceTitle;
    }

    public String getResourceLink() {
        return resourceLink;
    }

    public void setResourceLink(String resourceLink) {
        this.resourceLink = resourceLink;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }
}
