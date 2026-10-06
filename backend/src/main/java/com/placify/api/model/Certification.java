package com.placify.api.model;

import java.time.Instant;
import java.util.UUID;

public class Certification {
    private String id;
    private String name;
    private String certificateTitle;
    private String issuer;
    private String issueDate;
    private String certificateId;
    private String credentialUrl;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
    private String verificationStatus = "VERIFIED"; // VERIFIED, PENDING, REJECTED
    private String verificationReason;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Certification() {
        this.id = "cert-" + UUID.randomUUID().toString().substring(0, 8);
    }

    public Certification(String name, String issuer, String issueDate, String credentialUrl) {
        this.id = "cert-" + UUID.randomUUID().toString().substring(0, 8);
        this.name = name;
        this.certificateTitle = name;
        this.issuer = issuer;
        this.issueDate = issueDate;
        this.credentialUrl = credentialUrl;
        this.verificationStatus = "VERIFIED";
        this.verificationReason = "Manual entry / Institutional verification record";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return certificateTitle != null ? certificateTitle : name;
    }

    public void setName(String name) {
        this.name = name;
        if (this.certificateTitle == null) {
            this.certificateTitle = name;
        }
    }

    public String getCertificateTitle() {
        return certificateTitle != null ? certificateTitle : name;
    }

    public void setCertificateTitle(String certificateTitle) {
        this.certificateTitle = certificateTitle;
        this.name = certificateTitle;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getYear() {
        return issueDate;
    }

    public void setYear(String year) {
        if (year != null && !year.isBlank()) {
            this.issueDate = year;
        }
    }

    public String getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(String certificateId) {
        this.certificateId = certificateId;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    public void setCredentialUrl(String credentialUrl) {
        this.credentialUrl = credentialUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerificationReason() {
        return verificationReason;
    }

    public void setVerificationReason(String verificationReason) {
        this.verificationReason = verificationReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
