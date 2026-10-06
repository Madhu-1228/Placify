package com.placify.api.service;

import com.placify.api.exception.BadRequestException;
import com.placify.api.model.ResumeAnalysis;
import com.placify.api.model.StudentProfile;
import com.placify.api.repository.ResumeAnalysisRepository;
import com.placify.api.util.PdfTextExtractor;
import com.placify.api.util.ResumeContentValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeAnalysisService.class);

    @Autowired
    private StudentProfileService studentProfileService;

    @Autowired
    private PdfTextExtractor pdfTextExtractor;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Autowired
    private ResumeContentValidator resumeContentValidator;

    public ResumeAnalysis analyzeUploadedResume(String userId, MultipartFile file, List<String> targetSkills) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid PDF resume file to analyze.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Invalid file format. Only PDF documents (.pdf) are supported.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.equalsIgnoreCase("application/pdf")
                && !contentType.equalsIgnoreCase("application/octet-stream")
                && !contentType.contains("pdf")) {
            throw new BadRequestException("Invalid file type: " + contentType + ". Only PDF documents are supported for resume analysis.");
        }

        logger.info("[Resume Analyzer] PDF received: '{}' (Size: {} bytes)", originalFilename, file.getSize());

        StudentProfile profile = studentProfileService.getProfileByUserId(userId);

        try {
            byte[] bytes = file.getBytes();
            String extractedText = pdfTextExtractor.extractText(bytes);

            if (extractedText == null || extractedText.trim().length() < 40) {
                logger.warn("[Resume Analyzer] Text extraction failed or insufficient text in '{}'", originalFilename);
                throw new BadRequestException("Could not extract readable text from the uploaded PDF. Please make sure the resume contains selectable text (not scanned images).");
            }

            logger.info("[Resume Analyzer] Text extracted successfully from '{}' (Length: {} characters)",
                    originalFilename, extractedText.length());

            // =========================================================================
            // DEDICATED SAFETY GATE: RESUME VALIDATION STEP BEFORE ATS SCORING
            // =========================================================================
            logger.info("[Resume Validator] Checking document type for '{}'...", originalFilename);
            ResumeContentValidator.ValidationResult validation = resumeContentValidator.validate(extractedText, originalFilename);

            if (!validation.isResume()) {
                logger.warn("[Resume Validator] isResume=false, documentType={}, reason={}",
                        validation.getDocumentType(), validation.getReason());
                logger.warn("[Resume Analyzer] ATS analysis SKIPPED - Invalid document rejected: {}", validation.getReason());
                throw new BadRequestException(validation.getReason());
            }

            logger.info("[Resume Validator] isResume=true, documentType=resume");
            logger.info("[Resume Analyzer] Starting ATS analysis for student '{}' with {} target skills...",
                    profile.getName(), (targetSkills != null ? targetSkills.size() : 0));

            // STAGE 2: Perform ATS Analysis via Gemini AI (or verified fallback)
            ResumeAnalysis analysis = geminiService.analyzeResumeText(extractedText, profile.getName(), targetSkills);

            if (analysis == null || Boolean.FALSE.equals(analysis.getIsResume()) || analysis.getOverallScore() <= 0) {
                String reason = (analysis != null && StringUtils.hasText(analysis.getRejectionReason()))
                        ? analysis.getRejectionReason()
                        : "This document does not appear to be a resume or CV. Please upload a valid resume in PDF format to use the Resume Analyzer.";
                logger.warn("[Resume Analyzer] Semantic evaluation rejected document: {}", reason);
                throw new BadRequestException(reason);
            }

            analysis.setUserId(userId);
            analysis.setStudentId(profile.getId());
            analysis.setFileName(originalFilename);
            analysis.setCreatedAt(Instant.now());

            logger.info("[Resume Analyzer] ATS analysis completed successfully. Overall Score: {}, ATS Score: {}, Verdict: {}",
                    analysis.getOverallScore(), analysis.getAtsScore(), analysis.getReadinessVerdict());

            return resumeAnalysisRepository.save(analysis);
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception ex) {
            logger.error("[Resume Analyzer] Error during resume processing: {}", ex.getMessage(), ex);
            throw new BadRequestException("Failed to analyze resume: " + ex.getMessage());
        }
    }

    public Optional<ResumeAnalysis> getLatestAnalysis(String userId) {
        return resumeAnalysisRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ResumeAnalysis> getAnalysisHistory(String userId) {
        return resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
