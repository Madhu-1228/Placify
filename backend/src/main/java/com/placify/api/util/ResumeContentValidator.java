package com.placify.api.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class ResumeContentValidator {

    private static final Logger logger = LoggerFactory.getLogger(ResumeContentValidator.class);

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{3,5}\\)?[-.\\s]?)?\\d{3,5}[-.\\s]?\\d{3,5}"
    );

    private static final Pattern LINK_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?(?:linkedin\\.com|github\\.com|leetcode\\.com|hackerrank\\.com|gitlab\\.com|portfolio|bitbucket\\.org)/[a-zA-Z0-9_.-]+",
            Pattern.CASE_INSENSITIVE
    );

    // Section Header Regex Patterns (Lines or Headers)
    private static final Pattern EDUCATION_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:education|academic\\s+background|academic\\s+qualifications|educational\\s+qualifications|academic\\s+profile|education\\s*&?\\s*training)\\b|education\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SKILLS_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:technical\\s+skills|skills|core\\s+competencies|programming\\s+skills|programming\\s+languages|tools\\s*&\\s*technologies|technologies|tech\\s+stack|key\\s+skills|skills\\s*&?\\s*abilities)\\b|skills\\s*:|technical\\s+skills\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PROJECTS_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:projects|academic\\s+projects|technical\\s+projects|personal\\s+projects|key\\s+projects|selected\\s+projects|capstone\\s+project)\\b|projects\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern EXPERIENCE_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:experience|work\\s+experience|professional\\s+experience|internship|internships|employment\\s+history|work\\s+history)\\b|experience\\s*:|internship\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SUMMARY_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:career\\s+objective|professional\\s+summary|summary|profile\\s+summary|about\\s+me|objective)\\b|summary\\s*:|objective\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CERTIFICATIONS_HEADER_PATTERN = Pattern.compile(
            "(?m)^\\s*(?:certifications|certificates|achievements|honors\\s*&?\\s*awards|extracurricular\\s+activities|workshops)\\b|certifications\\s*:",
            Pattern.CASE_INSENSITIVE
    );

    public static class ValidationResult {
        private final boolean isResume;
        private final String documentType;
        private final String reason;

        public ValidationResult(boolean isResume, String documentType, String reason) {
            this.isResume = isResume;
            this.documentType = documentType;
            this.reason = reason;
        }

        public boolean isResume() {
            return isResume;
        }

        public boolean isValid() {
            return isResume;
        }

        public String getDocumentType() {
            return documentType;
        }

        public String getReason() {
            return reason;
        }

        public String getRejectionReason() {
            return reason;
        }

        public static ValidationResult validResume(String reason) {
            return new ValidationResult(true, "resume", reason);
        }

        public static ValidationResult reject(String documentType, String reason) {
            return new ValidationResult(false, documentType, reason);
        }
    }

    /**
     * Dedicated resume validation entry point.
     * Evaluates whether the extracted text represents an authentic resume/CV before any ATS analysis.
     */
    public ValidationResult validateResumeDocument(String extractedText) {
        return validate(extractedText, null);
    }

    /**
     * Comprehensive multi-signal document validator.
     */
    public ValidationResult validate(String rawText, String fileName) {
        if (!StringUtils.hasText(rawText) || rawText.trim().length() < 50) {
            logger.warn("[Resume Validator] Rejected: Insufficient text extracted (< 50 chars)");
            return ValidationResult.reject(
                    "unreadable_document",
                    "The uploaded document contains insufficient or unreadable text. Please upload a standard resume in PDF format with selectable text."
            );
        }

        String text = rawText.toLowerCase();

        // =====================================================================
        // DISQUALIFIER 1: Academic Marksheet / Semester Results / Grade Memo / Transcript
        // =====================================================================
        boolean hasMarksheetKeywords = text.contains("marks memo")
                || text.contains("marksheet")
                || text.contains("mark sheet")
                || text.contains("statement of marks")
                || text.contains("grade sheet")
                || text.contains("grade card")
                || text.contains("grade report")
                || text.contains("grades report")
                || text.contains("semester grade report")
                || text.contains("semester marks memo")
                || text.contains("semester results")
                || text.contains("semester result")
                || text.contains("consolidated marks memo")
                || text.contains("consolidated grade memo")
                || text.contains("memorandum of marks")
                || text.contains("provisional grade report")
                || text.contains("provisional certificate")
                || text.contains("academic transcript")
                || text.contains("official transcript")
                || text.contains("examination results")
                || text.contains("exam results")
                || text.contains("university results")
                || text.contains("college marks memo")
                || text.contains("student result sheet")
                || text.contains("subject-wise marks")
                || text.contains("academic performance report")
                || text.contains("examination score sheet")
                || text.contains("tabulation sheet")
                || text.contains("hall ticket")
                || text.contains("examination branch")
                || text.contains("controller of examinations")
                || text.contains("sgpa:") || text.contains("sgpa :")
                || (text.contains("sgpa") && text.contains("cgpa") && (text.contains("subject") || text.contains("grade points") || text.contains("course code")))
                || (text.contains("internal marks") && text.contains("external marks"))
                || (text.contains("grade points") && text.contains("course code"))
                || (text.contains("credits registered") && text.contains("credits earned"))
                || (text.contains("course title") && text.contains("letter grade") && text.contains("grade point"))
                || (text.contains("subject code") && text.contains("subject name") && (text.contains("grade") || text.contains("marks")))
                || (text.contains("total credits") && text.contains("grade letter") && text.contains("result: pass"))
                || (text.contains("marks secured") && text.contains("maximum marks") && text.contains("subject"))
                || (text.contains("passed in first class") && text.contains("memorandum"));

        int academicSignalsCount = 0;
        if (text.contains("semester") || text.contains("sem-") || text.contains("sem i") || text.contains("sem ii") || text.contains("sem iii") || text.contains("sem iv")) academicSignalsCount++;
        if (text.contains("subject") || text.contains("course code") || text.contains("subject code")) academicSignalsCount++;
        if (text.contains("grade") || text.contains("marks") || text.contains("credits") || text.contains("grade points")) academicSignalsCount++;
        if (text.contains("sgpa") || text.contains("cgpa") || text.contains("result:") || text.contains("passed")) academicSignalsCount++;
        if (text.contains("controller of examinations") || text.contains("examination branch") || text.contains("roll no") || text.contains("hall ticket")) academicSignalsCount++;
        if (text.contains("internal") && text.contains("external")) academicSignalsCount++;

        boolean isAcademicMarksheet = hasMarksheetKeywords || (academicSignalsCount >= 4);

        if (isAcademicMarksheet) {
            logger.warn("[Resume Validator] isResume=false, documentType=semester_marksheet, reason=Document identified as academic marks memo / semester results");
            return ValidationResult.reject(
                    "semester_marksheet",
                    "The uploaded document appears to be a semester marks sheet, grade transcript, or academic result document rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // DISQUALIFIER 2: Certificate / Course Credential
        // =====================================================================
        boolean hasCertDisqualifiers = text.contains("certificate of completion")
                || text.contains("certificate of achievement")
                || text.contains("certificate of participation")
                || text.contains("certificate of excellence")
                || text.contains("certificate of merit")
                || text.contains("this is to certify that")
                || text.contains("is hereby awarded to")
                || text.contains("has successfully completed")
                || text.contains("has completed the online course")
                || text.contains("has completed the course")
                || text.contains("course certificate")
                || text.contains("credential id:")
                || text.contains("authorized signatory")
                || text.contains("authorized signature")
                || text.contains("verify at coursera.org")
                || text.contains("verify.mygreatlearning.com")
                || text.contains("udemy.com/certificate");

        if (hasCertDisqualifiers) {
            logger.warn("[Resume Validator] isResume=false, documentType=course_certificate, reason=Document identified as certificate / course credential");
            return ValidationResult.reject(
                    "course_certificate",
                    "The uploaded document is a certificate or course credential rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // DISQUALIFIER 3: Project Report / Thesis / Capstone Documentation
        // =====================================================================
        boolean hasProjectReportDisqualifiers = text.contains("submitted in partial fulfillment")
                || text.contains("submitted in partial fulfilment")
                || text.contains("degree of bachelor of technology")
                || text.contains("degree of master of technology")
                || text.contains("under the guidance of")
                || text.contains("bonafide certificate")
                || text.contains("certificate of originality")
                || text.contains("table of contents")
                || text.contains("declaration by the candidate")
                || text.contains("literature survey")
                || text.contains("system architecture diagram")
                || (text.contains("chapter 1") && text.contains("chapter 2"))
                || text.contains("scope of future work")
                || text.contains("list of figures")
                || text.contains("list of tables")
                || text.contains("head of the department")
                || text.contains("guide signature")
                || (text.contains("internal examiner") && text.contains("external examiner"));

        if (hasProjectReportDisqualifiers) {
            logger.warn("[Resume Validator] isResume=false, documentType=project_report, reason=Document identified as academic project report / thesis");
            return ValidationResult.reject(
                    "project_report",
                    "The uploaded document appears to be a project report, thesis, or academic documentation rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // DISQUALIFIER 4: Examination Question Paper
        // =====================================================================
        boolean hasQuestionPaperDisqualifiers = text.contains("semester end examinations")
                || text.contains("mid examinations")
                || text.contains("question paper")
                || text.contains("answer any five questions")
                || text.contains("answer all questions")
                || text.contains("answer all the questions")
                || text.contains("time: 3 hours") || text.contains("time : 3 hours")
                || text.contains("max. marks") || text.contains("max marks") || text.contains("maximum marks:")
                || (text.contains("q.1") && text.contains("q.2") && text.contains("q.3"))
                || (text.contains("q1.") && text.contains("q2.") && text.contains("q3."))
                || text.contains("course outcome (co)") || text.contains("bloom's taxonomy")
                || text.contains("all questions carry equal marks");

        if (hasQuestionPaperDisqualifiers) {
            logger.warn("[Resume Validator] isResume=false, documentType=question_paper, reason=Document identified as examination question paper");
            return ValidationResult.reject(
                    "question_paper",
                    "The uploaded document appears to be an examination question paper rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // DISQUALIFIER 5: Syllabus / Assignment Sheet / Lab Manual
        // =====================================================================
        boolean hasSyllabusDisqualifiers = text.contains("course syllabus")
                || text.contains("course structure & syllabus")
                || text.contains("lab manual")
                || text.contains("experiment no")
                || text.contains("aim of the experiment")
                || text.contains("apparatus required")
                || (text.contains("assignment 1") && text.contains("assignment 2"))
                || (text.contains("unit - 1") && text.contains("unit - 2") && text.contains("unit - 3"))
                || (text.contains("unit-i") && text.contains("unit-ii") && text.contains("unit-iii"));

        if (hasSyllabusDisqualifiers) {
            logger.warn("[Resume Validator] isResume=false, documentType=syllabus_manual, reason=Document identified as syllabus / lab manual");
            return ValidationResult.reject(
                    "syllabus_manual",
                    "The uploaded document appears to be a syllabus, lab manual, or assignment sheet rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // DISQUALIFIER 6: Invoices / Bills / Financial Receipts
        // =====================================================================
        boolean hasFinancialDisqualifiers = text.contains("tax invoice")
                || text.contains("invoice number")
                || text.contains("bill to:")
                || text.contains("subtotal:")
                || text.contains("payment receipt")
                || text.contains("total amount paid");

        if (hasFinancialDisqualifiers) {
            return ValidationResult.reject(
                    "financial_document",
                    "The uploaded document appears to be an invoice or financial receipt rather than a resume. Please upload a valid resume in PDF format to use the Resume Analyzer."
            );
        }

        // =====================================================================
        // POSITIVE RESUME STRUCTURE EVALUATION
        // =====================================================================

        // 1. Candidate Contact Information (Email, Phone, Portfolio / Profiles)
        boolean hasEmail = EMAIL_PATTERN.matcher(rawText).find();
        boolean hasPhone = PHONE_PATTERN.matcher(rawText).find();
        boolean hasLink = LINK_PATTERN.matcher(rawText).find() || text.contains("linkedin.com") || text.contains("github.com") || text.contains("github.io");
        boolean hasContactHeaders = text.contains("email:") || text.contains("email :") || text.contains("phone:") || text.contains("phone :")
                || text.contains("mobile:") || text.contains("contact:") || text.contains("contact :") || text.contains("linkedin:") || text.contains("github:");

        boolean hasContactSignals = hasEmail || hasPhone || hasLink || hasContactHeaders;

        // 2. Structural Resume Section Headings
        boolean hasEducationHeader = EDUCATION_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("education:") || text.contains("academic background:")
                || (text.contains("education") && (text.contains("cgpa") || text.contains("b.tech") || text.contains("b.e.") || text.contains("gpa") || text.contains("university") || text.contains("college")));

        boolean hasSkillsHeader = SKILLS_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("technical skills:") || text.contains("skills:") || text.contains("skills & abilities:")
                || text.contains("tech stack:") || text.contains("programming languages:");

        boolean hasProjectsHeader = PROJECTS_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("projects:") || text.contains("technical projects:") || text.contains("academic projects:")
                || (text.contains("projects") && (text.contains("built") || text.contains("developed") || text.contains("created") || text.contains("implemented")));

        boolean hasExperienceHeader = EXPERIENCE_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("experience:") || text.contains("work experience:") || text.contains("internship:") || text.contains("professional experience:");

        boolean hasSummaryHeader = SUMMARY_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("career objective:") || text.contains("professional summary:") || text.contains("summary:") || text.contains("objective:");

        boolean hasCertificationsHeader = CERTIFICATIONS_HEADER_PATTERN.matcher(rawText).find()
                || text.contains("certifications:") || text.contains("achievements:") || text.contains("awards:");

        // 3. Technical Vocabulary Density
        List<String> commonTechKeywords = Arrays.asList(
                "java", "python", "c++", "c#", "javascript", "typescript", "react", "html", "css", "sql", "mysql",
                "mongodb", "postgresql", "spring", "spring boot", "node", "express", "git", "github", "docker",
                "aws", "dsa", "data structures", "algorithms", "rest api", "linux", "c programming", "fastapi", "django"
        );

        int techCount = 0;
        for (String tech : commonTechKeywords) {
            if (text.contains(tech)) {
                techCount++;
            }
        }

        // Count distinct structural resume headings
        int structuralSectionCount = 0;
        if (hasEducationHeader) structuralSectionCount++;
        if (hasSkillsHeader || techCount >= 3) structuralSectionCount++;
        if (hasProjectsHeader) structuralSectionCount++;
        if (hasExperienceHeader) structuralSectionCount++;
        if (hasSummaryHeader) structuralSectionCount++;
        if (hasCertificationsHeader) structuralSectionCount++;

        // =====================================================================
        // STRICT RESUME VALIDATION RULES
        // =====================================================================

        // Rule 1: Standard / Experienced Resume
        // Requires Contact info + at least 3 distinct resume section headings (e.g. Education + Skills + Projects)
        if (hasContactSignals && structuralSectionCount >= 3 && techCount >= 2) {
            logger.info("[Resume Validator] isResume=true, documentType=resume, sections={}, techCount={}",
                    structuralSectionCount, techCount);
            return ValidationResult.validResume("The document contains sufficient resume-specific sections and contact details.");
        }

        // Rule 2: Fresher Resume (e.g. Contact Info + Education + Skills + Projects/Objective)
        if (hasContactSignals && (hasEducationHeader || hasSummaryHeader) && (hasSkillsHeader || techCount >= 2) && (hasProjectsHeader || hasExperienceHeader || structuralSectionCount >= 2)) {
            logger.info("[Resume Validator] isResume=true, documentType=resume (Fresher format), sections={}", structuralSectionCount);
            return ValidationResult.validResume("The document contains valid fresher resume sections.");
        }

        // Rule 3: High Technical Skill Profile
        if (hasContactSignals && techCount >= 5 && (hasProjectsHeader || hasEducationHeader || hasExperienceHeader)) {
            logger.info("[Resume Validator] isResume=true, documentType=resume (Technical profile)");
            return ValidationResult.validResume("The document contains valid technical candidate resume content.");
        }

        // If it doesn't meet these structural resume rules, firmly reject it as a non-resume!
        logger.warn("[Resume Validator] isResume=false, documentType=unrecognized_document (Sections: {}, techCount: {}, contact: {})",
                structuralSectionCount, techCount, hasContactSignals);
        return ValidationResult.reject(
                "unrecognized_document",
                "This document does not appear to be a resume or CV. Please upload a valid resume in PDF format containing your profile, education, skills, projects, or experience."
        );
    }
}
