package com.placify.api;

import com.placify.api.model.ResumeAnalysis;
import com.placify.api.service.GeminiService;
import com.placify.api.service.ResumeAnalysisService;
import com.placify.api.util.PdfTextExtractor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class LiveGeminiIntegrationTest {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private PdfTextExtractor pdfTextExtractor;

    @BeforeAll
    public static void setup() {
        PlacifyApplication.loadDotEnv();
    }

    @Test
    public void testQuerySupportedModels() {
        String key = System.getProperty("GEMINI_API_KEY");
        if (key != null && !key.isEmpty()) {
            try {
                org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
                String v1beta = rt.getForObject("https://generativelanguage.googleapis.com/v1beta/models?key=" + key, String.class);
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(v1beta);
                com.fasterxml.jackson.databind.JsonNode models = root.path("models");
                System.out.println("=== AVAILABLE V1BETA MODELS COUNT: " + models.size() + " ===");
                for (com.fasterxml.jackson.databind.JsonNode m : models) {
                    System.out.println("Model: " + m.path("name").asText() + " | Supported: " + m.path("supportedGenerationMethods"));
                }
            } catch (Exception e) {
                System.out.println("Error querying v1beta: " + e.getMessage());
            }
        }
    }

    private byte[] createPdf(String[] lines) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.setLeading(16f);
                cs.newLineAtOffset(50, 700);

                for (String line : lines) {
                    cs.showText(line);
                    cs.newLine();
                }
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    @Test
    public void testLiveGeminiWithJavaResume() throws IOException {
        String[] content = {
                "Devanaboyina Madhu",
                "Email: 23BQ1A1228@vvit.net | Phone: +91 9876543210",
                "Education: B.Tech in Information Technology - CGPA: 8.85",
                "Technical Skills: Java, Spring Boot, Microservices, MongoDB, MySQL, Docker, REST APIs, Git",
                "Projects: PLACIFY - Campus Recruitment Tracking Platform with Spring Boot and React",
                "Project Description: Implemented JWT authentication, multi-stage drive workflows, and MongoDB aggregation",
                "Experience: Full Stack Engineering Intern at Tech Innovators (6 months)",
                "Certifications: Oracle Certified Java SE 17 Developer, AWS Cloud Practitioner"
        };

        byte[] pdfBytes = createPdf(content);
        String text = pdfTextExtractor.extractText(pdfBytes);
        assertNotNull(text);
        assertTrue(text.contains("Java"));

        ResumeAnalysis analysis = geminiService.analyzeResumeText(text, "Devanaboyina Madhu", List.of("Java", "Spring Boot", "AWS"));
        assertNotNull(analysis);
        assertTrue(analysis.getIsResume());
        assertNotNull(analysis.getAnalysisSource());
        System.out.println("=== JAVA RESUME ANALYSIS RESULT ===");
        System.out.println("Analysis Source: " + analysis.getAnalysisSource());
        System.out.println("Overall Score: " + analysis.getOverallScore());
        System.out.println("ATS Score: " + analysis.getAtsScore());
        System.out.println("Readiness: " + analysis.getReadinessVerdict());
        System.out.println("Detected Skills: " + analysis.getDetectedSkills());
    }

    @Test
    public void testLiveGeminiWithPythonAiResume() throws IOException {
        String[] content = {
                "Priya Sharma",
                "Email: priya.sharma@example.com | Phone: +91 9123456789",
                "Education: B.Tech in Artificial Intelligence & Data Science - CGPA: 9.10",
                "Technical Skills: Python, Machine Learning, Deep Learning, PyTorch, TensorFlow, Pandas, NumPy, Scikit-Learn",
                "Projects: Medical Image Tumor Detection using CNN and Vision Transformers with PyTorch",
                "Project Description: Trained deep learning vision model achieving 96% accuracy on chest X-ray datasets",
                "Experience: AI Research Intern at Computer Vision Labs (4 months)",
                "Publications: Conference paper on Deep Learning in Healthcare 2026"
        };

        byte[] pdfBytes = createPdf(content);
        String text = pdfTextExtractor.extractText(pdfBytes);
        assertNotNull(text);
        assertTrue(text.contains("Python"));

        ResumeAnalysis analysis = geminiService.analyzeResumeText(text, "Priya Sharma", List.of("Python", "Machine Learning", "PyTorch"));
        assertNotNull(analysis);
        assertTrue(analysis.getIsResume());
        System.out.println("=== PYTHON AI RESUME ANALYSIS RESULT ===");
        System.out.println("Analysis Source: " + analysis.getAnalysisSource());
        System.out.println("Overall Score: " + analysis.getOverallScore());
        System.out.println("ATS Score: " + analysis.getAtsScore());
        System.out.println("Readiness: " + analysis.getReadinessVerdict());
        System.out.println("Detected Skills: " + analysis.getDetectedSkills());
    }

    @Test
    public void testLiveGeminiWithMarksheet_Rejection() throws IOException {
        String[] content = {
                "VASCO UNIVERSITY OF TECHNOLOGY",
                "CONSOLIDATED SEMESTER MARKS MEMORANDUM",
                "Roll No: 23BQ1A1299 | Name: Student Test",
                "Subject Code 101: Engineering Mathematics III - Grade: A (85/100)",
                "Subject Code 102: Basic Electrical Engineering - Grade: B (72/100)",
                "Subject Code 103: Environmental Sciences - Grade: A+ (90/100)",
                "Total Credits Earned: 24 | SGPA: 8.40 | Cumulative CGPA: 8.25",
                "Result: PASSED IN FIRST CLASS WITH DISTINCTION"
        };

        byte[] pdfBytes = createPdf(content);
        String text = pdfTextExtractor.extractText(pdfBytes);
        assertNotNull(text);

        ResumeAnalysis analysis = geminiService.analyzeResumeText(text, "Student Test", List.of());
        assertNotNull(analysis);
        assertFalse(analysis.getIsResume(), "Marksheet should be flagged as isResume=false");
        System.out.println("=== MARKSHEET REJECTION RESULT ===");
        System.out.println("Analysis Source: " + analysis.getAnalysisSource());
        System.out.println("isResume: " + analysis.getIsResume());
        System.out.println("Rejection Reason: " + analysis.getRejectionReason());
    }

    @Autowired
    private ResumeAnalysisService resumeAnalysisService;

    @Autowired
    private com.placify.api.repository.UserRepository userRepository;

    @Test
    public void testResumeAnalysisServiceWithRealPdf() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "Devanaboyina Madhu",
                "Email: 23BQ1A1228@vvit.net | Phone: +91 9876543210",
                "Education: B.Tech in Information Technology - CGPA: 8.85",
                "Technical Skills: Java, Spring Boot, Microservices, MongoDB, MySQL, Docker, REST APIs, Git",
                "Projects: PLACIFY - Campus Recruitment Tracking Platform with Spring Boot and React",
                "Experience: Full Stack Engineering Intern at Tech Innovators (6 months)"
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile mockFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "madhu_resume.pdf", "application/pdf", pdfBytes
        );

        ResumeAnalysis analysis = resumeAnalysisService.analyzeUploadedResume(student.getId(), mockFile, List.of("Java", "Spring Boot"));
        assertNotNull(analysis);
        assertNotNull(analysis.getId());
        assertTrue(analysis.getIsResume());
        assertTrue(analysis.getOverallScore() > 0);
        assertNotNull(analysis.getAnalysisSource());
    }

    @Test
    public void testResumeAnalysisServiceRejectsNonPdf() {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        org.springframework.mock.web.MockMultipartFile txtFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "resume.txt", "text/plain", "This is plain text resume".getBytes()
        );

        com.placify.api.exception.BadRequestException ex = assertThrows(
                com.placify.api.exception.BadRequestException.class,
                () -> resumeAnalysisService.analyzeUploadedResume(student.getId(), txtFile, List.of())
        );

        assertTrue(ex.getMessage().toLowerCase().contains("pdf") || ex.getMessage().toLowerCase().contains("invalid"));
    }

    @Test
    public void testResumeAnalysisServiceRejectsMarksheet() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "VASCO UNIVERSITY OF TECHNOLOGY",
                "CONSOLIDATED SEMESTER MARKS MEMORANDUM",
                "Roll No: 23BQ1A1299 | Name: Student Test",
                "Subject Code 101: Engineering Mathematics III - Grade: A (85/100)",
                "Total Credits Earned: 24 | SGPA: 8.40 | Cumulative CGPA: 8.25"
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile marksheetFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "marksheet_sem4.pdf", "application/pdf", pdfBytes
        );

        com.placify.api.exception.BadRequestException ex = assertThrows(
                com.placify.api.exception.BadRequestException.class,
                () -> resumeAnalysisService.analyzeUploadedResume(student.getId(), marksheetFile, List.of())
        );

        assertNotNull(ex.getMessage());
        System.out.println("Service correctly rejected marksheet with message: " + ex.getMessage());
    }

    @Test
    public void testResumeAnalysisService_RejectsAwsCertificate() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "Amazon Web Services Training & Certification",
                "Certificate of Completion",
                "This is to certify that Devanaboyina Madhu has successfully completed the online course",
                "AWS Certified Solutions Architect Associate",
                "Issue Date: August 15, 2025",
                "Credential ID: AWS-8921389-CERT",
                "Authorized Signatory: Werner Vogels, CTO Amazon.com"
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile certFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "aws_cert.pdf", "application/pdf", pdfBytes
        );

        com.placify.api.exception.BadRequestException ex = assertThrows(
                com.placify.api.exception.BadRequestException.class,
                () -> resumeAnalysisService.analyzeUploadedResume(student.getId(), certFile, List.of())
        );

        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().toLowerCase().contains("certificate") || ex.getMessage().toLowerCase().contains("resume"));
    }

    @Test
    public void testResumeAnalysisService_RejectsProjectReport() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "A PROJECT REPORT ON",
                "SMART CAMPUS PLACEMENT MANAGEMENT SYSTEM",
                "Submitted in partial fulfillment of the requirements for B.Tech in CSE",
                "Under the guidance of Dr. K. Rama Krishna, Professor",
                "Department of Computer Science and Engineering",
                "Table of Contents",
                "Chapter 1: Introduction",
                "Chapter 2: Literature Survey",
                "Chapter 3: System Architecture Diagram",
                "Guide Signature    Head of the Department"
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile reportFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "project_report_final.pdf", "application/pdf", pdfBytes
        );

        com.placify.api.exception.BadRequestException ex = assertThrows(
                com.placify.api.exception.BadRequestException.class,
                () -> resumeAnalysisService.analyzeUploadedResume(student.getId(), reportFile, List.of())
        );

        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().toLowerCase().contains("project report") || ex.getMessage().toLowerCase().contains("documentation") || ex.getMessage().toLowerCase().contains("resume"));
    }

    @Test
    public void testResumeAnalysisService_RejectsQuestionPaper() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY",
                "III B.Tech II Semester Regular Examinations, April 2026",
                "DATA STRUCTURES & ALGORITHMS - QUESTION PAPER",
                "Time: 3 Hours        Max Marks: 70",
                "Answer any FIVE Questions. All questions carry equal marks.",
                "Q.1 Explain the difference between B-Tree and B+ Tree with diagrams.",
                "Q.2 Write an algorithm for Dijkstra's Single Source Shortest Path.",
                "Q.3 Describe Quick Sort time complexity in best, average and worst case."
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile qpFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "exam_question_paper.pdf", "application/pdf", pdfBytes
        );

        com.placify.api.exception.BadRequestException ex = assertThrows(
                com.placify.api.exception.BadRequestException.class,
                () -> resumeAnalysisService.analyzeUploadedResume(student.getId(), qpFile, List.of())
        );

        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().toLowerCase().contains("question paper") || ex.getMessage().toLowerCase().contains("examination") || ex.getMessage().toLowerCase().contains("resume"));
    }

    @Test
    public void testResumeAnalysisService_FresherResumeAccepted() throws IOException {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();

        String[] content = {
                "Devanaboyina Madhu",
                "Email: madhu.dev@gmail.com | Phone: 9876543210 | GitHub: github.com/MadhuD",
                "Career Objective: Aspiring Software Engineer looking to leverage Java and React in software development.",
                "Education: B.Tech in Information Technology, VVIT (2023 - 2027) - CGPA: 8.85",
                "Technical Skills: Java, Python, C++, React, Spring Boot, MySQL, MongoDB, Git",
                "Projects: Placify - AI Powered Campus Recruitment System using React and Spring Boot",
                "Projects: Cloud Storage Manager - Web app for automated cloud backups using AWS S3",
                "Certifications: AWS Certified Cloud Practitioner, Oracle Java SE 11"
        };

        byte[] pdfBytes = createPdf(content);
        org.springframework.mock.web.MockMultipartFile resumeFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "Madhu_Fresher_Resume.pdf", "application/pdf", pdfBytes
        );

        ResumeAnalysis analysis = resumeAnalysisService.analyzeUploadedResume(student.getId(), resumeFile, List.of("Java", "React"));
        assertNotNull(analysis);
        assertTrue(analysis.getIsResume());
        assertTrue(analysis.getOverallScore() >= 60);
        assertTrue(analysis.getAtsScore() >= 55);
        assertFalse(analysis.getDetectedSkills().isEmpty());
    }

    @Test
    public void testNoApiKeyExposedInSerializedJson() throws Exception {
        com.placify.api.model.User student = userRepository.findByUsernameIgnoreCase("MadhuD").orElseThrow();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis("Test resume text with Java and React", List.of());
        String json = mapper.writeValueAsString(analysis);

        assertFalse(json.contains("AIzaSy"));
        assertFalse(json.toLowerCase().contains("apikey"));
        assertFalse(json.toLowerCase().contains("api_key"));
    }
}
