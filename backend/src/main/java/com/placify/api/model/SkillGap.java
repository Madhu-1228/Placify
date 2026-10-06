package com.placify.api.model;

public class SkillGap {
    private String skillName;
    private SkillPriority priority;
    private String reason;
    private String category;

    public SkillGap() {
    }

    public SkillGap(String skillName, SkillPriority priority, String reason, String category) {
        this.skillName = skillName;
        this.priority = priority;
        this.reason = reason;
        this.category = category;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public SkillPriority getPriority() {
        return priority;
    }

    public void setPriority(SkillPriority priority) {
        this.priority = priority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
