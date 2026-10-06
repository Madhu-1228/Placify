package com.placify.api.dto;

import java.util.ArrayList;
import java.util.List;

public class EligibilityResultDto {

    private boolean eligible;
    private double matchPercentage;
    private List<String> reasons = new ArrayList<>();
    private List<String> passedCriteria = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private String driveId;
    private String companyName;
    private String role;

    public EligibilityResultDto() {
    }

    public EligibilityResultDto(boolean eligible, double matchPercentage, List<String> reasons, 
                                List<String> passedCriteria, List<String> missingSkills, 
                                String driveId, String companyName, String role) {
        this.eligible = eligible;
        this.matchPercentage = matchPercentage;
        this.reasons = reasons;
        this.passedCriteria = passedCriteria;
        this.missingSkills = missingSkills;
        this.driveId = driveId;
        this.companyName = companyName;
        this.role = role;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<String> getPassedCriteria() {
        return passedCriteria;
    }

    public void setPassedCriteria(List<String> passedCriteria) {
        this.passedCriteria = passedCriteria;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

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
}
