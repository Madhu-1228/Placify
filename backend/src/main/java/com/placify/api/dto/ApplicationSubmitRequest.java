package com.placify.api.dto;

public class ApplicationSubmitRequest {

    private String studentName;
    private String studentDepartment;
    private String studentRollNumber;
    private String studentEmail;
    private String studentPhone;
    private String resumeUrl;
    private Double cgpa;
    private Double studentCgpa;
    private Integer backlogs;
    private Integer studentBacklogs;
    private String notes;

    public ApplicationSubmitRequest() {
    }

    public ApplicationSubmitRequest(String studentName, String studentDepartment, String studentRollNumber, 
                                    String studentEmail, String studentPhone, String resumeUrl, Double cgpa, String notes) {
        this.studentName = studentName;
        this.studentDepartment = studentDepartment;
        this.studentRollNumber = studentRollNumber;
        this.studentEmail = studentEmail;
        this.studentPhone = studentPhone;
        this.resumeUrl = resumeUrl;
        this.cgpa = cgpa;
        this.notes = notes;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentDepartment() {
        return studentDepartment;
    }

    public void setStudentDepartment(String studentDepartment) {
        this.studentDepartment = studentDepartment;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentPhone() {
        return studentPhone;
    }

    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public Double getCgpa() {
        return cgpa != null ? cgpa : studentCgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Double getStudentCgpa() {
        return studentCgpa != null ? studentCgpa : cgpa;
    }

    public void setStudentCgpa(Double studentCgpa) {
        this.studentCgpa = studentCgpa;
    }

    public Integer getBacklogs() {
        return backlogs != null ? backlogs : studentBacklogs;
    }

    public void setBacklogs(Integer backlogs) {
        this.backlogs = backlogs;
    }

    public Integer getStudentBacklogs() {
        return studentBacklogs != null ? studentBacklogs : backlogs;
    }

    public void setStudentBacklogs(Integer studentBacklogs) {
        this.studentBacklogs = studentBacklogs;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
