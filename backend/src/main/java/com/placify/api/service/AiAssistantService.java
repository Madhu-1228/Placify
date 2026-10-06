package com.placify.api.service;

import com.placify.api.dto.AiChatRequestDto;
import com.placify.api.dto.AiChatResponseDto;
import com.placify.api.dto.ChatMessageDto;
import com.placify.api.model.*;
import com.placify.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(AiAssistantService.class);

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    public AiChatResponseDto processChat(String userId, AiChatRequestDto request) {
        if (request == null || !StringUtils.hasText(request.getMessage())) {
            throw new IllegalArgumentException("Chat query message cannot be empty.");
        }

        String userPrompt = request.getMessage().trim();
        List<ChatMessageDto> history = request.getHistory() != null ? request.getHistory() : new ArrayList<>();

        // 1. Gather real-time Placify MongoDB context for the student
        String systemContext = buildStudentAndPlatformContext(userId);

        // 2. Query Gemini AI / Fallback assistant
        String aiReply = geminiService.generateAiChatResponse(userPrompt, history, systemContext);

        // 3. Generate contextual follow-up prompts
        List<String> suggestions = generateContextualSuggestions(userPrompt);

        String source = "GEMINI_AI";

        return new AiChatResponseDto(aiReply, source, suggestions);
    }

    public List<String> getSuggestedPrompts(String userId) {
        List<String> list = new ArrayList<>();
        list.add("Explain HashMap and internal collision handling in Java");
        list.add("Which placement drives am I currently eligible for?");
        list.add("Create a 7-day DSA preparation plan for campus drives");
        list.add("Give me 10 frequent SQL & Database interview questions");
        list.add("How can I improve my technical resume ATS score?");
        list.add("What verified certifications do I have on my profile?");
        return list;
    }

    private String buildStudentAndPlatformContext(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are Placify AI, the premier personal placement and preparation assistant for students at Vasireddy Venkatadri International Technological University (VVITU CDS).\n");
        sb.append("Respond conversationally with clear markdown, bullet points, and code snippets where appropriate.\n\n");

        if (!StringUtils.hasText(userId)) {
            return sb.toString();
        }

        // 1. Student Profile Data
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
        if (profileOpt.isPresent()) {
            StudentProfile p = profileOpt.get();
            sb.append("=== AUTHENTICATED STUDENT DOSSIER ===\n");
            sb.append("- Name: ").append(p.getName() != null ? p.getName() : "Student").append("\n");
            sb.append("- Roll Number: ").append(p.getRollNumber() != null ? p.getRollNumber() : "N/A").append("\n");
            sb.append("- Department: ").append(p.getDepartment() != null ? p.getDepartment() : "Engineering").append("\n");
            sb.append("- Academic Standing: Year ").append(p.getYear() != null ? p.getYear() : 4)
                    .append(", Semester ").append(p.getSemester() != null ? p.getSemester() : 7).append("\n");
            sb.append("- Cumulative CGPA: ").append(p.getCgpa() != null ? p.getCgpa() : 0.0).append("\n");
            sb.append("- Active Backlogs: ").append(p.getBacklogs() != null ? p.getBacklogs() : 0).append("\n");
            sb.append("- Technical Skills: ").append(p.getSkills() != null && !p.getSkills().isEmpty()
                    ? String.join(", ", p.getSkills()) : "Java, SQL, Data Structures").append("\n");

            // Verified Certifications
            if (p.getCertifications() != null && !p.getCertifications().isEmpty()) {
                sb.append("- Verified Certifications (").append(p.getCertifications().size()).append("):\n");
                for (Certification c : p.getCertifications()) {
                    sb.append("  • ").append(c.getCertificateTitle() != null ? c.getCertificateTitle() : c.getName())
                            .append(" (Issued by: ").append(c.getIssuer() != null ? c.getIssuer() : "Authorized Body")
                            .append(", Status: ").append(c.getVerificationStatus() != null ? c.getVerificationStatus() : "VERIFIED")
                            .append(")\n");
                }
            } else {
                sb.append("- Verified Certifications: None uploaded yet.\n");
            }
            sb.append("\n");

            // 2. Active Drives & Real-Time Eligibility Match
            List<CompanyDrive> drives = companyDriveRepository.findAll();
            if (drives != null && !drives.isEmpty()) {
                sb.append("=== LIVE CAMPUS PLACEMENT DRIVES ===\n");
                for (CompanyDrive d : drives) {
                    boolean eligibleCgpa = p.getCgpa() >= (d.getMinimumCgpa() != null ? d.getMinimumCgpa() : 0.0);
                    boolean eligibleBacklogs = (p.getBacklogs() == null || p.getBacklogs() <= (d.getMaximumBacklogs() != null ? d.getMaximumBacklogs() : 0));
                    boolean eligibleDept = d.getEligibleDepartments() == null || d.getEligibleDepartments().isEmpty()
                            || d.getEligibleDepartments().stream().anyMatch(dept -> dept.equalsIgnoreCase(p.getDepartment()) || dept.equalsIgnoreCase("ALL"));
                    boolean isEligible = eligibleCgpa && eligibleBacklogs && eligibleDept;

                    sb.append("- Company: ").append(d.getCompanyName())
                            .append(" | Role: ").append(d.getRole() != null ? d.getRole() : "Software Engineer")
                            .append(" | CTC: ₹").append(d.getPackageCtc() != null ? d.getPackageCtc() : "Competitive").append(" LPA")
                            .append(" | Min CGPA: ").append(d.getMinimumCgpa())
                            .append(" | Max Backlogs: ").append(d.getMaximumBacklogs())
                            .append(" | Deadline: ").append(d.getApplicationDeadline() != null ? d.getApplicationDeadline() : "Open")
                            .append(" | Student Status: ").append(isEligible ? "ELIGIBLE ✓" : "NOT ELIGIBLE ✕")
                            .append("\n");
                }
                sb.append("\n");
            }

            // 3. Student Applications Pipeline
            List<Application> apps = applicationRepository.findByUserId(userId);
            if (apps != null && !apps.isEmpty()) {
                sb.append("=== STUDENT'S ACTIVE APPLICATIONS ===\n");
                for (Application a : apps) {
                    sb.append("- Company: ").append(a.getCompanyName())
                            .append(" | Current Status: ").append(a.getStatus())
                            .append(" | Applied Date: ").append(a.getAppliedAt() != null ? a.getAppliedAt() : "Recent")
                            .append("\n");
                }
                sb.append("\n");
            }

            // 4. Latest Resume Analysis Insights
            Optional<ResumeAnalysis> resumeOpt = resumeAnalysisRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
            if (resumeOpt.isPresent()) {
                ResumeAnalysis r = resumeOpt.get();
                sb.append("=== LATEST RESUME ATS EVALUATION ===\n");
                sb.append("- Overall Score: ").append(r.getOverallScore()).append("/100\n");
                sb.append("- ATS Compatibility Score: ").append(r.getAtsScore()).append("/100\n");
                sb.append("- Readiness Verdict: ").append(r.getReadinessVerdict()).append("\n");
                if (r.getMissingSkills() != null && !r.getMissingSkills().isEmpty()) {
                    sb.append("- Missing Industry Skills: ").append(String.join(", ", r.getMissingSkills())).append("\n");
                }
                sb.append("\n");
            }
        }

        // 5. Preparation Resources Catalog
        List<Resource> resources = resourceRepository.findAll();
        if (resources != null && !resources.isEmpty()) {
            sb.append("=== PLACIFY PREPARATION RESOURCE HUB TOPICS ===\n");
            Set<String> categories = resources.stream().map(Resource::getCategory).filter(Objects::nonNull).collect(Collectors.toSet());
            sb.append("Available Study Categories: ").append(String.join(", ", categories)).append("\n\n");
        }

        sb.append("IMPORTANT: Answer the student's question accurately. If they ask about their eligibility, applications, or drives, use ONLY the verified data listed above without hallucinating.");

        return sb.toString();
    }

    private List<String> generateContextualSuggestions(String prompt) {
        String lower = prompt.toLowerCase();
        List<String> list = new ArrayList<>();

        if (lower.contains("java") || lower.contains("hashmap") || lower.contains("oop")) {
            list.add("Give me 5 tricky Java interview questions");
            list.add("Explain multithreading and synchronization in Java");
            list.add("What is the difference between ArrayList and LinkedList?");
        } else if (lower.contains("dsa") || lower.contains("binary search") || lower.contains("algorithm")) {
            list.add("Explain sliding window pattern with an example");
            list.add("How to approach dynamic programming in interviews?");
            list.add("Give me top 10 LeetCode patterns for placements");
        } else if (lower.contains("drive") || lower.contains("eligible") || lower.contains("company")) {
            list.add("Which companies have the highest CTC package?");
            list.add("What is the interview process for Amazon Web Services?");
            list.add("How can I prepare for the upcoming technical round?");
        } else if (lower.contains("resume") || lower.contains("ats")) {
            list.add("How should I write project bullet points with metrics?");
            list.add("What skills should I highlight for a full-stack developer role?");
            list.add("How does the ATS score work in Placify?");
        } else {
            list.add("Which placement drives am I currently eligible for?");
            list.add("Give me 10 Java & SQL interview questions");
            list.add("How should I prepare for technical campus interviews?");
        }

        return list;
    }
}
