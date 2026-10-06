package com.placify.api;

import com.placify.api.model.ResumeAnalysis;
import com.placify.api.service.GeminiService;
import com.placify.api.util.ResumeContentValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeAnalysisTest {

    private GeminiService geminiService;
    private ResumeContentValidator validator;

    @BeforeEach
    public void setUp() {
        validator = new ResumeContentValidator();
        geminiService = new GeminiService();
        ReflectionTestUtils.setField(geminiService, "resumeContentValidator", validator);
    }

    @Test
    public void testResumeAnalysis_JavaBackendResume() {
        String javaResume = "Devanaboyina Madhu\n"
                + "Email: 23bq1a1228@vvit.net | Phone: +91 9876543210 | LinkedIn: linkedin.com/in/madhu\n"
                + "Education: B.Tech in Information Technology (CGPA: 8.85)\n"
                + "Technical Skills: Java, Spring Boot, MySQL, MongoDB, Docker, REST API, Git, Data Structures\n"
                + "Projects: PLACIFY Campus Recruitment Platform with Spring Boot, MongoDB and React.\n"
                + "Experience: Software Engineering Intern at Tech Solutions working with microservices.";

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(javaResume, List.of("Java", "Spring Boot", "AWS"));

        assertNotNull(analysis);
        assertTrue(analysis.getIsResume());
        assertTrue(analysis.getDetectedSkills().contains("Java"));
        assertTrue(analysis.getDetectedSkills().contains("Spring Boot"));
        assertTrue(analysis.getOverallScore() > 60);
        assertNotNull(analysis.getReadinessVerdict());
    }

    @Test
    public void testResumeAnalysis_DifferentResumesProduceDifferentResults() {
        String pythonResume = "Jane Doe\n"
                + "Email: jane.doe@gmail.com | Phone: +91 9848012345 | GitHub: github.com/janedoe\n"
                + "Education: B.Tech in Computer Science\n"
                + "Skills: Python, Machine Learning, Deep Learning, TensorFlow, PyTorch, Pandas, NumPy\n"
                + "Projects: Image Classification using Convolutional Neural Networks with PyTorch.\n"
                + "Internship: AI Research Intern.";

        String javaResume = "John Smith\n"
                + "Email: john.smith@gmail.com | Phone: +91 9848054321 | LinkedIn: linkedin.com/in/johnsmith\n"
                + "Education: B.Tech in IT\n"
                + "Skills: Java, Spring Boot, MySQL, REST API, Microservices, Docker\n"
                + "Projects: Enterprise E-commerce backend using Spring Boot.\n"
                + "Experience: Full-Stack Developer.";

        ResumeAnalysis pyAnalysis = geminiService.generateHeuristicAnalysis(pythonResume, List.of());
        ResumeAnalysis jvAnalysis = geminiService.generateHeuristicAnalysis(javaResume, List.of());

        assertTrue(pyAnalysis.getDetectedSkills().contains("Python"));
        assertTrue(pyAnalysis.getDetectedSkills().contains("Machine Learning"));
        assertFalse(pyAnalysis.getDetectedSkills().contains("Spring Boot"));

        assertTrue(jvAnalysis.getDetectedSkills().contains("Java"));
        assertTrue(jvAnalysis.getDetectedSkills().contains("Spring Boot"));
        assertFalse(jvAnalysis.getDetectedSkills().contains("Machine Learning"));
    }

    @Test
    public void testMarksheetDetection_RejectedAsNonResume() {
        String marksheet = "VASCO UNIVERSITY - CONSOLIDATED MARKS MEMO\n"
                + "Statement of Marks / Semester Grade Report\n"
                + "Roll Number: 23BQ1A1228\n"
                + "Subject: Engineering Mathematics - Grade: A+ | Grade Points: 10\n"
                + "Subject: Digital Electronics - Grade: A | Grade Points: 9\n"
                + "Credits Registered: 24 | Credits Earned: 24\n"
                + "SGPA: 8.90 | CGPA: 8.85\n"
                + "Result: PASSED";

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(marksheet, List.of());

        assertNotNull(analysis);
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
        assertEquals(0, analysis.getAtsScore());
        assertNotNull(analysis.getRejectionReason());
        assertTrue(analysis.getRejectionReason().toLowerCase().contains("marksheet") || analysis.getRejectionReason().toLowerCase().contains("grade"));
    }

    @Test
    public void testCertificateDetection_RejectedAsNonResume() {
        String certText = "Amazon Web Services Training & Certification\n"
                + "Certificate of Completion\n"
                + "This is to certify that Devanaboyina Madhu has successfully completed the online course\n"
                + "AWS Certified Cloud Practitioner Essentials\n"
                + "Issue Date: August 15, 2025\n"
                + "Credential ID: AWS-8921389-CERT\n"
                + "Authorized Signatory: Werner Vogels, CTO Amazon.com";

        ResumeContentValidator.ValidationResult result = validator.validate(certText, "aws_certificate.pdf");
        assertFalse(result.isValid());
        assertTrue(result.getRejectionReason().toLowerCase().contains("certificate"));

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(certText, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testProjectReport_RejectedAsNonResume() {
        String reportText = "A PROJECT REPORT ON\n"
                + "SMART CAMPUS PLACEMENT MANAGEMENT SYSTEM\n"
                + "Submitted in partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science\n"
                + "Under the guidance of Dr. K. Rama Krishna, Professor\n"
                + "Department of Computer Science and Engineering\n"
                + "Table of Contents\n"
                + "Chapter 1: Introduction\n"
                + "Chapter 2: Literature Survey\n"
                + "Chapter 3: System Architecture Diagram\n"
                + "Chapter 4: Implementation and Results\n"
                + "Guide Signature\t\tHead of the Department";

        ResumeContentValidator.ValidationResult result = validator.validate(reportText, "project_report.pdf");
        assertFalse(result.isValid());
        assertTrue(result.getRejectionReason().toLowerCase().contains("project report") || result.getRejectionReason().toLowerCase().contains("documentation"));

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(reportText, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testQuestionPaper_RejectedAsNonResume() {
        String examPaper = "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY\n"
                + "III B.Tech II Semester Regular Examinations, April 2026\n"
                + "DATA STRUCTURES & ALGORITHMS - QUESTION PAPER\n"
                + "Time: 3 Hours\t\tMax Marks: 70\n"
                + "Answer any FIVE Questions. All questions carry equal marks.\n"
                + "Q.1 Explain the difference between B-Tree and B+ Tree with diagrams. (14M)\n"
                + "Q.2 Write an algorithm for Dijkstra's Single Source Shortest Path. (14M)\n"
                + "Q.3 Describe Quick Sort time complexity in best, average and worst case. (14M)\n"
                + "Q.4 Explain Dynamic Programming approach for 0/1 Knapsack problem. (14M)";

        ResumeContentValidator.ValidationResult result = validator.validate(examPaper, "mid2_question_paper.pdf");
        assertFalse(result.isValid());
        assertTrue(result.getRejectionReason().toLowerCase().contains("question paper") || result.getRejectionReason().toLowerCase().contains("examination"));

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(examPaper, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testSyllabusAndLabManual_RejectedAsNonResume() {
        String syllabus = "DEPARTMENT OF INFORMATION TECHNOLOGY\n"
                + "Course Syllabus & Lab Manual\n"
                + "Course Code: 23IT601 - Java & Web Technologies Lab\n"
                + "Experiment No 1: Aim of the experiment: Write a Java program to implement multithreading.\n"
                + "Apparatus Required: JDK 17, Eclipse IDE.\n"
                + "Assignment 1: Implement producer consumer problem using wait() and notify().\n"
                + "Assignment 2: Create a servlet communicating with MySQL database.";

        ResumeContentValidator.ValidationResult result = validator.validate(syllabus, "lab_syllabus.pdf");
        assertFalse(result.isValid());
        assertTrue(result.getRejectionReason().toLowerCase().contains("syllabus") || result.getRejectionReason().toLowerCase().contains("lab manual"));

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(syllabus, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testFresherResumeWithoutExperience_AcceptedAsValidResume() {
        String fresherResume = "Devanaboyina Madhu\n"
                + "Email: madhu.dev@gmail.com | Phone: 9876543210 | GitHub: github.com/MadhuD\n"
                + "Career Objective: Aspiring Software Engineer looking to leverage Java and React skills in product development.\n"
                + "Education:\n"
                + "- B.Tech in Information Technology, VVIT (2023 - 2027) | CGPA: 8.85\n"
                + "- Intermediate (MPC), Sri Chaitanya (2021 - 2023) | 96%\n"
                + "Technical Skills:\n"
                + "- Languages: Java, Python, C++\n"
                + "- Web Technologies: React, HTML, CSS, JavaScript, Spring Boot, REST APIs\n"
                + "- Databases: MySQL, MongoDB\n"
                + "- Tools: Git, VS Code, Postman\n"
                + "Projects:\n"
                + "1. Placify - AI Powered Campus Recruitment System\n"
                + "Built full-stack placement portal using React, Spring Boot, and MongoDB with resume analyzer and drive tracking.\n"
                + "2. Weather Forecast App\n"
                + "Created responsive web application consuming OpenWeather API with live radar charts.\n"
                + "Certifications:\n"
                + "- AWS Certified Cloud Practitioner\n"
                + "- Oracle Java SE 11 Developer";

        ResumeContentValidator.ValidationResult result = validator.validate(fresherResume, "Madhu_Fresher_Resume.pdf");
        assertTrue(result.isValid(), "Fresher resume with contact info, education, technical skills and projects must be accepted");

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(fresherResume, List.of("Java", "React", "Spring Boot"));
        assertTrue(analysis.getIsResume());
        assertTrue(analysis.getOverallScore() >= 70);
        assertTrue(analysis.getAtsScore() >= 65);
    }

    @Test
    public void testSemesterResultWithSubjectGrades_Rejected() {
        String semResult = "VASCO INSTITUTE OF TECHNOLOGY\n"
                + "SEMESTER RESULTS - B.TECH III YEAR I SEMESTER REGULAR EXAMINATIONS\n"
                + "Hall Ticket No: 23BQ1A1228 | Student Name: Devanaboyina Madhu\n"
                + "Course Code | Course Title | Credits | Letter Grade | Grade Points\n"
                + "23CS501 | Operating Systems | 3.0 | O | 10\n"
                + "23CS502 | Computer Networks | 3.0 | A+ | 9\n"
                + "23CS503 | Database Management Systems | 3.0 | A | 8\n"
                + "23CS504 | Design and Analysis of Algorithms | 3.0 | A+ | 9\n"
                + "SGPA: 9.00 | CGPA: 8.85 | Result: PASSED\n"
                + "Controller of Examinations";

        ResumeContentValidator.ValidationResult result = validator.validateResumeDocument(semResult);
        assertNotNull(result);
        assertFalse(result.isResume(), "Semester result PDF must be rejected");
        assertEquals("semester_marksheet", result.getDocumentType());
        assertTrue(result.getReason().toLowerCase().contains("semester") || result.getReason().toLowerCase().contains("marks"));

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(semResult, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
        assertEquals(0, analysis.getAtsScore());
    }

    @Test
    public void testAcademicTranscript_Rejected() {
        String transcript = "OFFICIAL ACADEMIC TRANSCRIPT\n"
                + "Office of the Registrar & Academic Affairs\n"
                + "Student Name: John Smith | Roll No: 2021BCSE045\n"
                + "Degree: Bachelor of Technology in Computer Science\n"
                + "Semester I Total Credits: 22 | SGPA: 8.2\n"
                + "Semester II Total Credits: 24 | SGPA: 8.5\n"
                + "Semester III Total Credits: 24 | SGPA: 8.9\n"
                + "Semester IV Total Credits: 22 | SGPA: 8.7\n"
                + "Cumulative Grade Point Average (CGPA): 8.58\n"
                + "Registrar Signature";

        ResumeContentValidator.ValidationResult result = validator.validateResumeDocument(transcript);
        assertFalse(result.isResume());
        assertEquals("semester_marksheet", result.getDocumentType());

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(transcript, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testInvoiceOrReceipt_Rejected() {
        String invoice = "TAX INVOICE / PAYMENT RECEIPT\n"
                + "Invoice Number: INV-2026-9812\n"
                + "Bill To: Customer Services Inc.\n"
                + "Item: Cloud Hosting Services (1 Year) - $120.00\n"
                + "Item: Domain Registration - $15.00\n"
                + "Subtotal: $135.00 | Tax: $15.00 | Total Amount Paid: $150.00\n"
                + "Thank you for your business!";

        ResumeContentValidator.ValidationResult result = validator.validateResumeDocument(invoice);
        assertFalse(result.isResume());
        assertEquals("financial_document", result.getDocumentType());

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(invoice, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }

    @Test
    public void testGenericArticleOrEssay_Rejected() {
        String article = "THE FUTURE OF ARTIFICIAL INTELLIGENCE IN HEALTHCARE\n"
                + "By Dr. Alan Turing, Department of Computer Science\n"
                + "Abstract: In this paper we discuss the transformative role of deep learning in modern diagnostic systems.\n"
                + "Healthcare providers worldwide are adopting automated radiological scanning techniques to detect anomalies early.\n"
                + "While computational models have achieved impressive accuracy, challenges regarding data privacy and explainability remain prevalent.\n"
                + "Conclusion: Continued interdisciplinary collaboration is essential for safe clinical deployment.";

        ResumeContentValidator.ValidationResult result = validator.validateResumeDocument(article);
        assertFalse(result.isResume());
        assertEquals("unrecognized_document", result.getDocumentType());

        ResumeAnalysis analysis = geminiService.generateHeuristicAnalysis(article, List.of());
        assertFalse(analysis.getIsResume());
        assertEquals(0, analysis.getOverallScore());
    }
}
