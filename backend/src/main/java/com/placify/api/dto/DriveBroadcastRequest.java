package com.placify.api.dto;

public class DriveBroadcastRequest {
    private String driveId;
    private String title;
    private String message;
    private String documentUrl;
    private String documentName;
    private String noticeText;
    private String whatsappText;
    private String targetDepartment = "ALL";

    public DriveBroadcastRequest() {
    }

    public String getDriveId() {
        return driveId;
    }

    public void setDriveId(String driveId) {
        this.driveId = driveId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getNoticeText() {
        return noticeText;
    }

    public void setNoticeText(String noticeText) {
        this.noticeText = noticeText;
    }

    public String getWhatsappText() {
        return whatsappText;
    }

    public void setWhatsappText(String whatsappText) {
        this.whatsappText = whatsappText;
    }

    public String getTargetDepartment() {
        return targetDepartment;
    }

    public void setTargetDepartment(String targetDepartment) {
        this.targetDepartment = targetDepartment;
    }
}
