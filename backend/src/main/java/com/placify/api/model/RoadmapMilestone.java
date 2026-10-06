package com.placify.api.model;

import java.util.ArrayList;
import java.util.List;

public class RoadmapMilestone {
    private String milestoneNumber; // e.g. "WEEK 1", "DAY 1-3", "MODULE 1"
    private String title;
    private String focusArea;
    private String learningObjective;
    private List<RoadmapTask> tasks = new ArrayList<>();

    public RoadmapMilestone() {
    }

    public RoadmapMilestone(String milestoneNumber, String title, String focusArea, String learningObjective, List<RoadmapTask> tasks) {
        this.milestoneNumber = milestoneNumber;
        this.title = title;
        this.focusArea = focusArea;
        this.learningObjective = learningObjective;
        this.tasks = tasks != null ? tasks : new ArrayList<>();
    }

    public String getMilestoneNumber() {
        return milestoneNumber;
    }

    public void setMilestoneNumber(String milestoneNumber) {
        this.milestoneNumber = milestoneNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFocusArea() {
        return focusArea;
    }

    public void setFocusArea(String focusArea) {
        this.focusArea = focusArea;
    }

    public String getLearningObjective() {
        return learningObjective;
    }

    public void setLearningObjective(String learningObjective) {
        this.learningObjective = learningObjective;
    }

    public List<RoadmapTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<RoadmapTask> tasks) {
        this.tasks = tasks;
    }
}
