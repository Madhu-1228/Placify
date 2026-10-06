package com.placify.api.dto;

public class CertificateVerificationResultDto {
    private boolean isCertificate;
    private double confidence;
    private String certificateTitle;
    private String issuer;
    private String recipient;
    private String issueDate;
    private String certificateId;
    private String reason;

    public CertificateVerificationResultDto() {
    }

    public CertificateVerificationResultDto(boolean isCertificate, double confidence, String certificateTitle, String issuer, String recipient, String issueDate, String certificateId, String reason) {
        this.isCertificate = isCertificate;
        this.confidence = confidence;
        this.certificateTitle = certificateTitle;
        this.issuer = issuer;
        this.recipient = recipient;
        this.issueDate = issueDate;
        this.certificateId = certificateId;
        this.reason = reason;
    }

    public boolean isCertificate() {
        return isCertificate;
    }

    public void setCertificate(boolean certificate) {
        isCertificate = certificate;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getCertificateTitle() {
        return certificateTitle;
    }

    public void setCertificateTitle(String certificateTitle) {
        this.certificateTitle = certificateTitle;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(String certificateId) {
        this.certificateId = certificateId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
