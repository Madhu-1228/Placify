package com.placify.api.service;

import com.placify.api.dto.CertificateVerificationResultDto;
import com.placify.api.exception.BadRequestException;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.Certification;
import com.placify.api.model.StudentProfile;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.util.PdfTextExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.*;

@Service
public class CertificateManagementService {

    private static final Logger logger = LoggerFactory.getLogger(CertificateManagementService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");

    @Value("${file.upload-dir:uploads}")
    private String uploadBaseDir;

    @Autowired
    private PdfTextExtractor pdfTextExtractor;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private StudentProfileService studentProfileService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    public Certification uploadAndVerifyCertificate(
            String userId,
            MultipartFile file,
            String name,
            String issuer,
            String issueDate,
            String credentialUrl) {

        // STEP 1: Strict File Validation
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid certificate file to upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File is too large. Please upload a certificate smaller than 10 MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            originalFilename = "certificate.pdf";
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG certificate.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.toLowerCase().contains("pdf")
                && !contentType.toLowerCase().contains("image")
                && !contentType.equalsIgnoreCase("application/octet-stream")) {
            throw new BadRequestException("Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG certificate.");
        }

        StudentProfile profile = studentProfileService.getProfileByUserId(userId);
        String studentName = profile.getName() != null ? profile.getName() : "Candidate";

        // STEP 2: Content Extraction
        String extractedText = "";
        try {
            byte[] bytes = file.getBytes();
            if (extension.equals("pdf")) {
                try {
                    extractedText = pdfTextExtractor.extractText(bytes);
                } catch (Exception pe) {
                    logger.warn("PDFTextStripper had low text yield for certificate, treating as image-based certificate: {}", pe.getMessage());
                    extractedText = "Certificate document: " + originalFilename + " " + (StringUtils.hasText(name) ? name : "");
                }
            } else {
                // Image file
                extractedText = "Certificate image document: " + originalFilename + " " + (StringUtils.hasText(name) ? name : "");
            }
        } catch (IOException ioe) {
            throw new BadRequestException("We couldn't read this file. Please upload a valid certificate.");
        }

        // STEP 3: Multi-Step Verification Pipeline (Deterministic + Gemini AI)
        CertificateVerificationResultDto verification = geminiService.verifyCertificateContent(
                extractedText, originalFilename, contentType, studentName
        );

        if (!verification.isCertificate()) {
            String rejectionMessage = StringUtils.hasText(verification.getReason())
                    ? verification.getReason()
                    : "This document does not appear to be a certificate. Please upload a valid certification document.";
            throw new BadRequestException(rejectionMessage);
        }

        // STEP 4: Store file securely on disk
        String rollPrefix = StringUtils.hasText(profile.getRollNumber())
                ? profile.getRollNumber().replaceAll("[^a-zA-Z0-9]", "_")
                : "Student_" + userId.substring(0, Math.min(6, userId.length()));

        String savedFilename = rollPrefix + "_Cert_" + System.currentTimeMillis() + "." + extension;
        String publicUrl;

        try {
            Path targetFolder = Paths.get(uploadBaseDir, "certificates").toAbsolutePath().normalize();
            if (!Files.exists(targetFolder)) {
                Files.createDirectories(targetFolder);
            }

            Path targetPath = targetFolder.resolve(savedFilename).normalize();
            if (!targetPath.startsWith(targetFolder)) {
                throw new BadRequestException("Invalid file path destination.");
            }
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            publicUrl = "/uploads/certificates/" + savedFilename;
        } catch (IOException e) {
            logger.error("Failed to persist certificate file: {}", e.getMessage());
            throw new RuntimeException("Failed to store uploaded certificate. Please try again.", e);
        }

        // STEP 5: Create Verified Certification Record with Student Provided & Verified Metadata
        Certification cert = new Certification();
        cert.setId("cert-" + UUID.randomUUID().toString().substring(0, 8));

        // Prioritize student-entered values, fallback to AI extracted values
        String finalTitle = StringUtils.hasText(name)
                ? name.trim()
                : (StringUtils.hasText(verification.getCertificateTitle()) ? verification.getCertificateTitle() : stripExtension(originalFilename));

        String finalIssuer = StringUtils.hasText(issuer)
                ? issuer.trim()
                : (StringUtils.hasText(verification.getIssuer()) ? verification.getIssuer() : "Authorized Organization");

        String finalDate = StringUtils.hasText(issueDate)
                ? issueDate.trim()
                : (StringUtils.hasText(verification.getIssueDate()) ? verification.getIssueDate() : "2026");

        cert.setCertificateTitle(finalTitle);
        cert.setName(finalTitle);
        cert.setIssuer(finalIssuer);
        cert.setIssueDate(finalDate);
        cert.setCertificateId(verification.getCertificateId());
        if (StringUtils.hasText(credentialUrl)) {
            cert.setCredentialUrl(credentialUrl.trim());
        }
        cert.setFileName(originalFilename);
        cert.setFileType(extension.toUpperCase());
        cert.setFileUrl(publicUrl);
        cert.setFileSize(file.getSize());
        cert.setVerificationStatus("VERIFIED");
        cert.setVerificationReason(StringUtils.hasText(verification.getReason())
                ? verification.getReason() : "AI-Assisted Certificate Validation Verified ✓");
        cert.setCreatedAt(Instant.now());
        cert.setUpdatedAt(Instant.now());

        // Append to profile certifications list
        List<Certification> certs = profile.getCertifications();
        if (certs == null) {
            certs = new ArrayList<>();
        }
        certs.add(cert);
        profile.setCertifications(certs);

        // Recalculate profile score
        profile.setProfileCompletionPercentage(studentProfileService.calculateCompletion(profile));
        profile.setUpdatedAt(Instant.now());
        studentProfileRepository.save(profile);

        logger.info("Successfully uploaded and verified certificate '{}' ({}) for student {}", finalTitle, finalIssuer, studentName);
        return cert;
    }

    public List<Certification> getStudentCertifications(String userId) {
        StudentProfile profile = studentProfileService.getProfileByUserId(userId);
        return profile.getCertifications() != null ? profile.getCertifications() : Collections.emptyList();
    }

    public void deleteCertification(String userId, String certId) {
        StudentProfile profile = studentProfileService.getProfileByUserId(userId);
        List<Certification> certs = profile.getCertifications();
        if (certs == null || certs.isEmpty()) {
            throw new ResourceNotFoundException("No certifications found for this student.");
        }

        Certification toDelete = certs.stream()
                .filter(c -> c.getId() != null && c.getId().equalsIgnoreCase(certId))
                .findFirst()
                .orElse(null);

        if (toDelete == null) {
            throw new ResourceNotFoundException("Certification not found: " + certId);
        }

        certs.remove(toDelete);

        // Securely delete physical file from disk if stored locally
        if (StringUtils.hasText(toDelete.getFileUrl()) && toDelete.getFileUrl().startsWith("/uploads/certificates/")) {
            try {
                String filename = toDelete.getFileUrl().substring("/uploads/certificates/".length());
                Path baseCertDir = Paths.get(uploadBaseDir, "certificates").toAbsolutePath().normalize();
                Path filePath = baseCertDir.resolve(filename).normalize();
                if (filePath.startsWith(baseCertDir) && Files.exists(filePath)) {
                    Files.deleteIfExists(filePath);
                    logger.info("Deleted certificate file from disk: {}", filePath);
                }
            } catch (Exception e) {
                logger.warn("Could not delete certificate file from disk: {}", e.getMessage());
            }
        }

        profile.setCertifications(certs);
        profile.setProfileCompletionPercentage(studentProfileService.calculateCompletion(profile));
        profile.setUpdatedAt(Instant.now());
        studentProfileRepository.save(profile);
        logger.info("Deleted certification {} for student {}", certId, profile.getName());
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0 && dotIndex < filename.length() - 1)
                ? filename.substring(dotIndex + 1)
                : "";
    }

    private String stripExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 ? filename.substring(0, dotIndex).replace('_', ' ').replace('-', ' ') : filename;
    }
}
