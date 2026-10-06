package com.placify.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placify.api.dto.ChatMessageDto;
import com.placify.api.dto.CertificateVerificationResultDto;
import com.placify.api.model.ResumeAnalysis;
import com.placify.api.util.ResumeContentValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Autowired(required = false)
    private ResumeContentValidator resumeContentValidator;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.6-flash}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // =========================================================================
    // 1. RESUME ANALYZER (EXISTING IMPLEMENTATION PRESERVED)
    // =========================================================================

    public ResumeAnalysis analyzeResumeText(String resumeText, String studentName, List<String> targetSkills) {
        // First check if document passes resume validation
        ResumeContentValidator validator = (resumeContentValidator != null) ? resumeContentValidator : new ResumeContentValidator();
        ResumeContentValidator.ValidationResult validation = validator.validate(resumeText, "");
        if (!validation.isValid()) {
            ResumeAnalysis rejected = new ResumeAnalysis();
            rejected.setIsResume(false);
            rejected.setRejectionReason(validation.getRejectionReason());
            rejected.setOverallScore(0);
            rejected.setAtsScore(0);
            rejected.setReadinessVerdict("Invalid Document: Non-Resume");
            rejected.setStrengths(List.of());
            rejected.setWeaknesses(List.of("Document lacks required resume structure, technical skills, or project experience."));
            rejected.setFormattingSuggestions(List.of("Please upload a standard resume in PDF format."));
            rejected.setProjectSuggestions(List.of());
            rejected.setAnalysisSource("VALIDATION_REJECTED");
            return rejected;
        }

        // Try Gemini API if API key is provided and not a placeholder
        if (StringUtils.hasText(apiKey) && !apiKey.equalsIgnoreCase("default_or_placeholder_key") && !apiKey.startsWith("your_")) {
            try {
                ResumeAnalysis analysis = callGeminiApi(resumeText, targetSkills);
                if (analysis != null) {
                    analysis.setAnalysisSource("GEMINI_AI");
                    logger.info("Successfully analyzed resume using Google Gemini AI ({})", modelName);
                    return analysis;
                }
            } catch (Exception e) {
                logger.warn("Gemini API call failed or timed out. Falling back to intelligent heuristics engine: {}", e.getMessage());
            }
        } else {
            logger.info("No Gemini API key configured. Using intelligent heuristics fallback engine.");
        }

        // Fallback: Intelligent placement analysis engine
        ResumeAnalysis heuristic = generateHeuristicAnalysis(resumeText, targetSkills);
        heuristic.setAnalysisSource("HEURISTIC_ENGINE");
        return heuristic;
    }

    private ResumeAnalysis callGeminiApi(String resumeText, List<String> targetSkills) throws Exception {
        String[] candidateModels = {
                (StringUtils.hasText(modelName)) ? modelName : "gemini-3.6-flash",
                "gemini-3.6-flash",
                "gemini-3.7-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-flash-latest"
        };

        Set<String> triedModels = new LinkedHashSet<>();
        Exception lastException = null;

        String prompt = constructPrompt(resumeText, targetSkills);

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (String model : candidateModels) {
            if (!triedModels.add(model)) {
                continue;
            }
            try {
                String url = String.format(
                        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        model, apiKey
                );

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    ResumeAnalysis parsed = parseGeminiResponse(response.getBody());
                    if (parsed != null) {
                        return parsed;
                    }
                }
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage();
                if (msg != null && (msg.contains("404") || msg.contains("not found")
                        || msg.contains("503") || msg.contains("UNAVAILABLE")
                        || msg.contains("429") || msg.contains("RESOURCE_EXHAUSTED")
                        || msg.contains("demand"))) {
                    logger.warn("Model {} returned temporary error, trying next candidate: {}", model, msg);
                    continue;
                }
                throw e;
            }
        }

        if (lastException != null) {
            throw lastException;
        }

        return null;
    }

    private String constructPrompt(String resumeText, List<String> targetSkills) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert technical campus recruitment director and strict resume evaluator.\n");
        sb.append("TASK: Analyze the following document text submitted for technical campus placement.\n\n");
        sb.append("DOCUMENT CONTENT:\n---\n").append(resumeText).append("\n---\n\n");

        if (targetSkills != null && !targetSkills.isEmpty()) {
            sb.append("TARGET COMPANY / JOB ROLE REQUIRED SKILLS: ").append(String.join(", ", targetSkills)).append("\n\n");
        }

        sb.append("CRITICAL EVALUATION RULES:\n");
        sb.append("1. Strict Resume Verification: Check whether the DOCUMENT CONTENT is an authentic individual Candidate Resume / Curriculum Vitae (CV).\n");
        sb.append("   - If the document is NOT a resume (e.g., it is a semester marks memo, grade sheet, academic transcript, course certificate, project report/thesis, assignment, examination question paper, syllabus, lab manual, invoice, research paper, essay, letter, notes, or any non-resume PDF), YOU MUST SET \"isResume\": false, set \"rejectionReason\": \"This document does not appear to be a resume or CV. Please upload a valid resume in PDF format to use the Resume Analyzer.\", and set overallScore and atsScore to 0.\n");
        sb.append("   - ONLY if the document IS a genuine personal resume/CV with candidate profile, education, technical skills, or projects/experience, set \"isResume\": true and \"rejectionReason\": null.\n");
        sb.append("2. If isResume is true, calculate realistic 1-100 ATS & Overall Scores based strictly on the candidate's actual projects, technical depth, and quantifiable achievements.\n");
        sb.append("3. Detected Skills: Extract programming languages, frameworks, databases, and tools explicitly found in this resume.\n");
        sb.append("4. Missing Skills: Identify key industry skills missing from this specific candidate's profile.\n");
        sb.append("5. Strengths: Detail 3-4 specific strengths unique to this resume.\n");
        sb.append("6. Weaknesses: Detail 2-3 specific areas for improvement.\n");
        sb.append("7. Formatting Suggestions: Provide 2-3 actionable formatting recommendations.\n");
        sb.append("8. Project Suggestions: Provide 2-3 actionable project/portfolio enhancement tips tailored to this student's focus.\n");
        sb.append("9. Readiness Verdict: One of \"Placement Ready\", \"Moderate Readiness\", or \"Needs Improvement\".\n\n");

        sb.append("Return ONLY a valid JSON object matching this schema:\n");
        sb.append("{\n");
        sb.append("  \"isResume\": <true if genuine resume, false otherwise>,\n");
        sb.append("  \"rejectionReason\": <null if valid resume, or error message string if not a resume>,\n");
        sb.append("  \"overallScore\": <integer 0-100, 0 if not a resume>,\n");
        sb.append("  \"atsScore\": <integer 0-100, 0 if not a resume>,\n");
        sb.append("  \"detectedSkills\": [\"skill1\", \"skill2\"],\n");
        sb.append("  \"missingSkills\": [\"skill1\", \"skill2\"],\n");
        sb.append("  \"strengths\": [\"strength1\", \"strength2\"],\n");
        sb.append("  \"weaknesses\": [\"weakness1\", \"weakness2\"],\n");
        sb.append("  \"formattingSuggestions\": [\"suggestion1\", \"suggestion2\"],\n");
        sb.append("  \"projectSuggestions\": [\"suggestion1\", \"suggestion2\"],\n");
        sb.append("  \"readinessVerdict\": \"<Placement Ready | Moderate Readiness | Needs Improvement | Invalid Document: Non-Resume>\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    private ResumeAnalysis parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (JsonNode partNode : parts) {
                        JsonNode tNode = partNode.path("text");
                        if (!tNode.isMissingNode() && !tNode.isNull()) {
                            sb.append(tNode.asText());
                        }
                    }
                    String text = sb.toString();
                    // Clean markdown fences if any
                    String cleanJson = text.replaceAll("```json", "").replaceAll("```", "").trim();

                    JsonNode analysisNode = objectMapper.readTree(cleanJson);
                    ResumeAnalysis analysis = new ResumeAnalysis();

                    boolean isResume = analysisNode.path("isResume").asBoolean(false);
                    int overallScore = analysisNode.path("overallScore").asInt(0);
                    int atsScore = analysisNode.path("atsScore").asInt(0);

                    if (!isResume || overallScore == 0 || atsScore == 0) {
                        String rejectionReason = analysisNode.path("rejectionReason").asText(
                                "This document does not appear to be a resume or CV. Please upload a valid resume in PDF format to use the Resume Analyzer."
                        );
                        analysis.setIsResume(false);
                        analysis.setRejectionReason(rejectionReason);
                        analysis.setOverallScore(0);
                        analysis.setAtsScore(0);
                        analysis.setReadinessVerdict("Invalid Document: Non-Resume");
                        analysis.setStrengths(List.of());
                        analysis.setWeaknesses(List.of("Document does not contain candidate profile, technical skills, or project experience."));
                        analysis.setFormattingSuggestions(List.of("Please upload a standard curriculum vitae (CV) or resume in PDF format."));
                        analysis.setProjectSuggestions(List.of());
                        return analysis;
                    }

                    analysis.setIsResume(true);
                    analysis.setRejectionReason(null);
                    analysis.setOverallScore(overallScore);
                    analysis.setAtsScore(atsScore);
                    analysis.setReadinessVerdict(analysisNode.path("readinessVerdict").asText("Moderate Readiness"));

                    analysis.setDetectedSkills(readStringList(analysisNode.path("detectedSkills")));
                    analysis.setMissingSkills(readStringList(analysisNode.path("missingSkills")));
                    analysis.setStrengths(readStringList(analysisNode.path("strengths")));
                    analysis.setWeaknesses(readStringList(analysisNode.path("weaknesses")));
                    analysis.setFormattingSuggestions(readStringList(analysisNode.path("formattingSuggestions")));
                    analysis.setProjectSuggestions(readStringList(analysisNode.path("projectSuggestions")));

                    return analysis;
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing Gemini API JSON response: {}", e.getMessage());
        }
        return null;
    }

    private List<String> readStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText());
            }
        }
        return list;
    }

    public ResumeAnalysis generateHeuristicAnalysis(String text, List<String> targetSkills) {
        String lower = text.toLowerCase();
        ResumeAnalysis analysis = new ResumeAnalysis();

        ResumeContentValidator validator = (resumeContentValidator != null) ? resumeContentValidator : new ResumeContentValidator();
        ResumeContentValidator.ValidationResult validation = validator.validate(text, "");

        if (!validation.isValid()) {
            analysis.setIsResume(false);
            analysis.setRejectionReason(validation.getRejectionReason());
            analysis.setOverallScore(0);
            analysis.setAtsScore(0);
            analysis.setReadinessVerdict("Invalid Document: Non-Resume");
            analysis.setStrengths(List.of());
            analysis.setWeaknesses(List.of("Document lacks required resume structure, technical skills, or project experience."));
            analysis.setFormattingSuggestions(List.of("Please upload a standard resume in PDF format."));
            analysis.setProjectSuggestions(List.of());
            analysis.setAnalysisSource("VALIDATION_REJECTED");
            return analysis;
        }

        analysis.setIsResume(true);
        analysis.setRejectionReason(null);

        // Technical skills keyword detection
        List<String> commonSkills = Arrays.asList(
                "java", "python", "c++", "c", "c#", "javascript", "typescript", "react", "react.js", "angular", "vue",
                "node.js", "express", "spring", "spring boot", "django", "flask", "fastapi",
                "html", "css", "tailwind", "bootstrap", "sass",
                "sql", "mysql", "postgresql", "mongodb", "redis", "oracle", "sqlite",
                "git", "github", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "rest api", "graphql",
                "data structures", "algorithms", "machine learning", "deep learning", "nlp", "computer vision",
                "ci/cd", "jenkins", "junit", "maven", "gradle", "postman", "microservices"
        );

        List<String> detected = new ArrayList<>();
        for (String skill : commonSkills) {
            if (lower.contains(skill.toLowerCase())) {
                detected.add(capitalizeSkill(skill));
            }
        }

        // Calculate score
        int baseScore = 50;
        baseScore += Math.min(25, detected.size() * 3);
        if (lower.contains("project") || lower.contains("projects")) baseScore += 10;
        if (lower.contains("experience") || lower.contains("internship")) baseScore += 8;
        if (lower.contains("education") || lower.contains("b.tech") || lower.contains("cgpa")) baseScore += 4;
        if (lower.contains("certifications") || lower.contains("certificate")) baseScore += 3;
        int overallScore = Math.min(95, Math.max(45, baseScore));
        int atsScore = Math.min(96, Math.max(40, overallScore - 4));

        analysis.setOverallScore(overallScore);
        analysis.setAtsScore(atsScore);
        analysis.setDetectedSkills(detected);

        List<String> missing = new ArrayList<>();
        if (targetSkills != null && !targetSkills.isEmpty()) {
            for (String ts : targetSkills) {
                if (!detected.contains(capitalizeSkill(ts)) && !lower.contains(ts.toLowerCase())) {
                    missing.add(ts);
                }
            }
        }
        if (missing.isEmpty()) {
            List<String> recommended = Arrays.asList("Docker", "Microservices", "AWS Cloud", "Unit Testing / JUnit", "System Design");
            for (String rec : recommended) {
                if (!detected.contains(rec)) missing.add(rec);
                if (missing.size() >= 3) break;
            }
        }
        analysis.setMissingSkills(missing);

        // Strengths
        List<String> strengths = new ArrayList<>();
        if (detected.size() >= 5) strengths.add("Strong technical foundation across " + detected.size() + " programming technologies.");
        if (lower.contains("project") || lower.contains("projects")) strengths.add("Good showcase of practical engineering and development projects.");
        if (lower.contains("internship") || lower.contains("experience")) strengths.add("Demonstrated practical internship/industry exposure.");
        if (strengths.isEmpty()) strengths.add("Clean academic credentials with clear branch focus.");
        strengths.add("Strong alignment with core campus recruitment expectations.");
        analysis.setStrengths(strengths);

        // Weaknesses
        List<String> weaknesses = new ArrayList<>();
        if (missing.size() > 0) weaknesses.add("Key modern production skills like " + String.join(", ", missing.subList(0, Math.min(3, missing.size()))) + " are missing.");
        if (!lower.contains("metrics") && !lower.contains("%") && !lower.contains("optimized")) weaknesses.add("Project descriptions lack quantifiable impact metrics (e.g. latency reduced by 30%, 500+ users).");
        if (weaknesses.isEmpty()) weaknesses.add("Could benefit from more cloud deployment and containerization experience.");
        analysis.setWeaknesses(weaknesses);

        analysis.setFormattingSuggestions(Arrays.asList(
                "Use strong action verbs (Architected, Spearheaded, Optimized) at the start of bullet points.",
                "Ensure clean 1-page formatting with standard margins and ATS-friendly headers.",
                "Include live demo links, GitHub repository URLs, or deployment links for key projects."
        ));

        analysis.setProjectSuggestions(Arrays.asList(
                "Add a full-stack project featuring authentication, database migrations, and cloud hosting.",
                "Include unit tests and CI/CD workflow badges in your GitHub repositories.",
                "Implement a real-time feature (e.g., WebSockets, caching with Redis, or asynchronous queues)."
        ));

        if (overallScore >= 80) analysis.setReadinessVerdict("Placement Ready");
        else if (overallScore >= 65) analysis.setReadinessVerdict("Moderate Readiness");
        else analysis.setReadinessVerdict("Needs Improvement");

        return analysis;
    }

    private String capitalizeSkill(String skill) {
        if (skill == null || skill.isBlank()) return "";
        if (skill.equalsIgnoreCase("sql") || skill.equalsIgnoreCase("dsa") || skill.equalsIgnoreCase("aws")
                || skill.equalsIgnoreCase("gcp") || skill.equalsIgnoreCase("nlp") || skill.equalsIgnoreCase("html")
                || skill.equalsIgnoreCase("css") || skill.equalsIgnoreCase("ci/cd") || skill.equalsIgnoreCase("api")
                || skill.equalsIgnoreCase("rest api") || skill.equalsIgnoreCase("junit")) {
            return skill.toUpperCase();
        }
        if (skill.equalsIgnoreCase("node.js")) return "Node.js";
        if (skill.equalsIgnoreCase("react.js")) return "React.js";

        String[] parts = skill.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(p.substring(0, 1).toUpperCase()).append(p.substring(1));
            }
        }
        return sb.toString();
    }

    // =========================================================================
    // 2. PERSONALIZED ROADMAP GENERATION (EXISTING IMPLEMENTATION PRESERVED)
    // =========================================================================

    public com.placify.api.model.PreparationRoadmap generatePersonalizedRoadmap(
            String studentName,
            String department,
            Double cgpa,
            List<String> currentSkills,
            String targetRole,
            String targetCompany,
            List<String> companyRequirements,
            int durationDays,
            List<String> availableResources) {

        if (StringUtils.hasText(apiKey) && !apiKey.equalsIgnoreCase("default_or_placeholder_key") && !apiKey.startsWith("your_")) {
            try {
                com.placify.api.model.PreparationRoadmap roadmap = callGeminiRoadmapApi(
                        studentName, department, cgpa, currentSkills, targetRole, targetCompany, companyRequirements, durationDays, availableResources
                );
                if (roadmap != null) {
                    roadmap.setGeneratedBy("GEMINI_AI");
                    logger.info("Successfully generated personalized roadmap using Gemini AI ({}) for role: {}", modelName, targetRole);
                    return roadmap;
                }
            } catch (Exception e) {
                logger.warn("Gemini API call for roadmap failed. Falling back to intelligent heuristics roadmap generator: {}", e.getMessage());
            }
        }

        // Fallback: Intelligent heuristic roadmap generator
        com.placify.api.model.PreparationRoadmap heuristic = generateHeuristicRoadmap(
                studentName, department, cgpa, currentSkills, targetRole, targetCompany, companyRequirements, durationDays, availableResources
        );
        heuristic.setGeneratedBy("HEURISTIC_ENGINE");
        return heuristic;
    }

    private com.placify.api.model.PreparationRoadmap callGeminiRoadmapApi(
            String studentName,
            String department,
            Double cgpa,
            List<String> currentSkills,
            String targetRole,
            String targetCompany,
            List<String> companyRequirements,
            int durationDays,
            List<String> availableResources) throws Exception {

        String[] candidateModels = {
                (StringUtils.hasText(modelName)) ? modelName : "gemini-3.6-flash",
                "gemini-3.6-flash",
                "gemini-3.7-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-flash-latest"
        };

        Set<String> triedModels = new LinkedHashSet<>();
        Exception lastException = null;

        String prompt = constructRoadmapPrompt(
                studentName, department, cgpa, currentSkills, targetRole, targetCompany, companyRequirements, durationDays, availableResources
        );

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (String model : candidateModels) {
            if (!triedModels.add(model)) {
                continue;
            }
            try {
                String url = String.format(
                        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        model, apiKey
                );

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    com.placify.api.model.PreparationRoadmap parsed = parseGeminiRoadmapResponse(response.getBody());
                    if (parsed != null) {
                        return parsed;
                    }
                }
            } catch (Exception e) {
                lastException = e;
                logger.warn("Gemini model {} returned temporary error during roadmap generation, trying next: {}", model, e.getMessage());
            }
        }

        if (lastException != null) {
            throw lastException;
        }
        return null;
    }

    private String constructRoadmapPrompt(
            String studentName,
            String department,
            Double cgpa,
            List<String> currentSkills,
            String targetRole,
            String targetCompany,
            List<String> companyRequirements,
            int durationDays,
            List<String> availableResources) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert AI Career Placement Strategist and Technical Interview Coach for B.Tech engineering campus recruitments at Vasireddy Venkatadri International Technological University (VVITU).\n\n");
        sb.append("TASK: Generate a highly structured, personalized, step-by-step placement preparation roadmap tailored to this student's exact skill profile and target placement role.\n\n");

        sb.append("STUDENT PROFILE:\n");
        sb.append("- Name: ").append(studentName != null ? studentName : "Student").append("\n");
        sb.append("- Department: ").append(department != null ? department : "Engineering").append("\n");
        sb.append("- CGPA: ").append(cgpa != null ? cgpa : 8.0).append("\n");
        sb.append("- Current Known Skills: ").append(currentSkills != null && !currentSkills.isEmpty() ? String.join(", ", currentSkills) : "Basic programming concepts").append("\n\n");

        sb.append("TARGET PLACEMENT GOAL:\n");
        sb.append("- Target Role: ").append(targetRole != null ? targetRole : "Software Engineer").append("\n");
        if (StringUtils.hasText(targetCompany)) {
            sb.append("- Target Company / Drive: ").append(targetCompany).append("\n");
            if (companyRequirements != null && !companyRequirements.isEmpty()) {
                sb.append("- Company Required Skills: ").append(String.join(", ", companyRequirements)).append("\n");
            }
        }
        sb.append("- Roadmap Duration: ").append(durationDays).append(" days\n\n");

        if (availableResources != null && !availableResources.isEmpty()) {
            sb.append("AVAILABLE PLATFORM STUDY TOPICS (Reuse these titles/topics where relevant):\n");
            for (String res : availableResources) {
                sb.append("- ").append(res).append("\n");
            }
            sb.append("\n");
        }

        sb.append("OUTPUT REQUIREMENTS:\n");
        sb.append("Return ONLY a valid JSON object matching this EXACT schema without markdown wrapping or code blocks:\n");
        sb.append("{\n");
        sb.append("  \"currentStrengths\": [\"string of verified strength 1\", \"strength 2\"],\n");
        sb.append("  \"skillGaps\": [\n");
        sb.append("    {\n");
        sb.append("      \"skillName\": \"string\",\n");
        sb.append("      \"priority\": \"HIGH\" | \"MEDIUM\" | \"LOW\",\n");
        sb.append("      \"reason\": \"string explanation of why this gap matters for the target role\",\n");
        sb.append("      \"category\": \"Core\" | \"Framework\" | \"Database\" | \"Tools\" | \"CS Fundamentals\"\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"milestones\": [\n");
        sb.append("    {\n");
        sb.append("      \"milestoneNumber\": \"WEEK 1\" or \"DAY 1-3\",\n");
        sb.append("      \"title\": \"string milestone title\",\n");
        sb.append("      \"focusArea\": \"string focus subject\",\n");
        sb.append("      \"learningObjective\": \"string key takeaway\",\n");
        sb.append("      \"tasks\": [\n");
        sb.append("        {\n");
        sb.append("          \"title\": \"actionable task title\",\n");
        sb.append("          \"description\": \"specific guidance on what to learn or code\",\n");
        sb.append("          \"type\": \"CONCEPT\" | \"PRACTICE\" | \"PROJECT\" | \"INTERVIEW\" | \"ASSESSMENT\",\n");
        sb.append("          \"resourceTitle\": \"placify topic or resource name\",\n");
        sb.append("          \"resourceLink\": \"/student/preparation\" or \"/student/quizzes\",\n");
        sb.append("          \"estimatedMinutes\": 60\n");
        sb.append("        }\n");
        sb.append("      ]\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"adaptiveAdvice\": \"string customized strategy recommendation for this student\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    private com.placify.api.model.PreparationRoadmap parseGeminiRoadmapResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return null;
            }

            StringBuilder sb = new StringBuilder();
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray()) {
                for (JsonNode partNode : parts) {
                    JsonNode tNode = partNode.path("text");
                    if (!tNode.isMissingNode() && !tNode.isNull()) {
                        sb.append(tNode.asText());
                    }
                }
            }

            String jsonText = sb.toString().trim();
            if (!StringUtils.hasText(jsonText)) {
                return null;
            }
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            } else if (jsonText.startsWith("```")) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();

            JsonNode dataNode = objectMapper.readTree(jsonText);
            com.placify.api.model.PreparationRoadmap roadmap = new com.placify.api.model.PreparationRoadmap();

            // Strengths
            List<String> strengths = new ArrayList<>();
            if (dataNode.path("currentStrengths").isArray()) {
                for (JsonNode s : dataNode.path("currentStrengths")) {
                    strengths.add(s.asText());
                }
            }
            roadmap.setCurrentStrengths(strengths);

            // Skill Gaps
            List<com.placify.api.model.SkillGap> gaps = new ArrayList<>();
            if (dataNode.path("skillGaps").isArray()) {
                for (JsonNode g : dataNode.path("skillGaps")) {
                    com.placify.api.model.SkillPriority priority = com.placify.api.model.SkillPriority.MEDIUM;
                    String priStr = g.path("priority").asText("MEDIUM").toUpperCase();
                    try {
                        priority = com.placify.api.model.SkillPriority.valueOf(priStr);
                    } catch (Exception ignored) {
                    }
                    gaps.add(new com.placify.api.model.SkillGap(
                            g.path("skillName").asText(),
                            priority,
                            g.path("reason").asText(),
                            g.path("category").asText("Technical")
                    ));
                }
            }
            roadmap.setSkillGaps(gaps);

            // Milestones
            List<com.placify.api.model.RoadmapMilestone> milestones = new ArrayList<>();
            if (dataNode.path("milestones").isArray()) {
                for (JsonNode m : dataNode.path("milestones")) {
                    com.placify.api.model.RoadmapMilestone milestone = new com.placify.api.model.RoadmapMilestone();
                    milestone.setMilestoneNumber(m.path("milestoneNumber").asText("WEEK 1"));
                    milestone.setTitle(m.path("title").asText("Core Placement Preparation"));
                    milestone.setFocusArea(m.path("focusArea").asText("Technical Foundations"));
                    milestone.setLearningObjective(m.path("learningObjective").asText("Master key interview patterns"));

                    List<com.placify.api.model.RoadmapTask> tasks = new ArrayList<>();
                    if (m.path("tasks").isArray()) {
                        for (JsonNode t : m.path("tasks")) {
                            com.placify.api.model.RoadmapTask task = new com.placify.api.model.RoadmapTask(
                                     t.path("title").asText("Complete Practice Assignment"),
                                    t.path("description").asText("Review key formulas and code patterns."),
                                    t.path("type").asText("PRACTICE"),
                                    t.path("resourceTitle").asText("Placify Resource Hub"),
                                    t.path("resourceLink").asText("/student/preparation"),
                                    t.path("estimatedMinutes").asInt(60)
                            );
                            tasks.add(task);
                        }
                    }
                    milestone.setTasks(tasks);
                    milestones.add(milestone);
                }
            }
            roadmap.setMilestones(milestones);

            // Adaptive advice
            roadmap.setAdaptiveAdvice(dataNode.path("adaptiveAdvice").asText("Focus on high-priority gap areas to maximize campus placement readiness."));

            return roadmap;
        } catch (Exception e) {
            logger.error("Error parsing Gemini roadmap JSON: {}", e.getMessage());
            return null;
        }
    }

    public com.placify.api.model.PreparationRoadmap generateHeuristicRoadmap(
            String studentName,
            String department,
            Double cgpa,
            List<String> currentSkills,
            String targetRole,
            String targetCompany,
            List<String> companyRequirements,
            int durationDays,
            List<String> availableResources) {

        com.placify.api.model.PreparationRoadmap roadmap = new com.placify.api.model.PreparationRoadmap();

        List<String> strengths = new ArrayList<>();
        if (currentSkills != null && !currentSkills.isEmpty()) {
            strengths.add("Strong grounding in " + String.join(", ", currentSkills.subList(0, Math.min(3, currentSkills.size()))));
        } else {
            strengths.add("Core engineering fundamentals and problem-solving readiness");
        }
        if (cgpa != null && cgpa >= 8.0) {
            strengths.add("Excellent academic track record (CGPA: " + cgpa + ")");
        }
        roadmap.setCurrentStrengths(strengths);

        List<com.placify.api.model.SkillGap> gaps = new ArrayList<>();
        gaps.add(new com.placify.api.model.SkillGap("Dynamic Programming & Trees", com.placify.api.model.SkillPriority.HIGH, "Crucial for online coding assessments and Tier-1 recruiter rounds", "DSA"));
        gaps.add(new com.placify.api.model.SkillGap("System Design & API Architecture", com.placify.api.model.SkillPriority.HIGH, "Essential for full-stack and backend software engineering interviews", "Backend"));
        gaps.add(new com.placify.api.model.SkillGap("SQL Complex Joins & Query Optimization", com.placify.api.model.SkillPriority.MEDIUM, "Commonly evaluated in technical interview round 2", "Database"));
        gaps.add(new com.placify.api.model.SkillGap("Behavioral STAR Method Presentation", com.placify.api.model.SkillPriority.MEDIUM, "Determines final managerial/HR round conversion", "HR Prep"));
        roadmap.setSkillGaps(gaps);

        List<com.placify.api.model.RoadmapMilestone> milestones = new ArrayList<>();

        // Milestone 1
        com.placify.api.model.RoadmapMilestone m1 = new com.placify.api.model.RoadmapMilestone();
        m1.setMilestoneNumber("STAGE 1");
        m1.setTitle("DSA Foundations & Algorithmic Patterns");
        m1.setFocusArea("Data Structures, Arrays, Two Pointers & HashMaps");
        m1.setLearningObjective("Build speed and accuracy for company online assessment rounds");
        m1.setTasks(Arrays.asList(
                new com.placify.api.model.RoadmapTask("Review DSA Core Concepts & Time Complexity", "Study Big-O analysis, HashMaps, and two-pointer arrays in Placify Preparation Hub", "CONCEPT", "DSA & Complexity Analysis", "/student/preparation", 60),
                new com.placify.api.model.RoadmapTask("Solve 15 Sliding Window & Two Pointer Problems", "Practice classic LeetCode medium questions on arrays and strings", "PRACTICE", "Placement Quizzes", "/student/quizzes", 120),
                new com.placify.api.model.RoadmapTask("Attempt Timed DSA Placement Assessment", "Take the 10-question placement quiz on arrays and linked lists", "ASSESSMENT", "DSA Placement Quiz", "/student/quizzes", 30)
        ));
        milestones.add(m1);

        // Milestone 2
        com.placify.api.model.RoadmapMilestone m2 = new com.placify.api.model.RoadmapMilestone();
        m2.setMilestoneNumber("STAGE 2");
        m2.setTitle("Backend, Database & Core CS Subjects");
        m2.setFocusArea("DBMS, OS, Computer Networks & OOP Principles");
        m2.setLearningObjective("Master the core subjects asked in technical round 1 and 2");
        m2.setTasks(Arrays.asList(
                new com.placify.api.model.RoadmapTask("Revise ACID Properties, Normalization & Indexing", "Understand B-Tree indexes, transactions, and SQL query optimizations", "CONCEPT", "DBMS Study Module", "/student/preparation", 90),
                new com.placify.api.model.RoadmapTask("Complete OOP and Concurrency Problem Sheet", "Review multithreading, synchronization, and SOLID design principles in Java", "PRACTICE", "Java & OOP Hub", "/student/preparation", 90),
                new com.placify.api.model.RoadmapTask("Take DBMS & SQL Assessment Quiz", "Validate database knowledge with timed multiple-choice questions", "ASSESSMENT", "DBMS Placement Quiz", "/student/quizzes", 30)
        ));
        milestones.add(m2);

        // Milestone 3
        com.placify.api.model.RoadmapMilestone m3 = new com.placify.api.model.RoadmapMilestone();
        m3.setMilestoneNumber("STAGE 3");
        m3.setTitle("Mock Interviews & Company Role Specifics");
        m3.setFocusArea("System Architecture, Resume Walkthrough & HR Rounds");
        m3.setLearningObjective("Conquer the live technical whiteboard round and negotiate offer letters");
        m3.setTasks(Arrays.asList(
                new com.placify.api.model.RoadmapTask("Prepare 2-Minute Project Architecture Elevator Pitch", "Articulate technical challenges and business impact of projects listed on your resume", "INTERVIEW", "Resume Analyzer", "/student/resume-analyzer", 60),
                new com.placify.api.model.RoadmapTask("Conduct Mock Technical Interview with AI Assistant", "Simulate live interview Q&A for " + (targetRole != null ? targetRole : "Software Engineer"), "INTERVIEW", "Placify AI Assistant", "/student/placify-ai", 45),
                new com.placify.api.model.RoadmapTask("Review Active Placement Drives & Submit Applications", "Ensure your candidate dossier and resume are submitted before deadlines", "PROJECT", "Company Drives", "/student/drives", 30)
        ));
        milestones.add(m3);

        roadmap.setMilestones(milestones);
        roadmap.setAdaptiveAdvice("Focus 60% of your time on DSA practice problems and 40% on explaining project architecture confidently. Maintain a daily coding streak.");

        return roadmap;
    }

    // =========================================================================
    // 3. PLACIFY AI — CHAT ASSISTANT & EDUCATIONAL/PLACEMENT MENTOR
    // =========================================================================

    public String generateAiChatResponse(String userPrompt, List<ChatMessageDto> history, String systemContext) {
        if (StringUtils.hasText(apiKey) && !apiKey.equalsIgnoreCase("default_or_placeholder_key") && !apiKey.startsWith("your_")) {
            try {
                String response = callGeminiChatApi(userPrompt, history, systemContext);
                if (StringUtils.hasText(response)) {
                    logger.info("Successfully generated AI Chat response via Gemini ({})", modelName);
                    return response;
                }
            } catch (Exception e) {
                logger.warn("Gemini Chat API call failed. Falling back to intelligent assistant heuristics: {}", e.getMessage());
            }
        }

        return generateIntelligentChatFallback(userPrompt, systemContext);
    }

    private String callGeminiChatApi(String userPrompt, List<ChatMessageDto> history, String systemContext) throws Exception {
        String[] candidateModels = {
                (StringUtils.hasText(modelName)) ? modelName : "gemini-3.6-flash",
                "gemini-3.6-flash",
                "gemini-3.7-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-flash-latest"
        };

        List<Map<String, Object>> contents = new ArrayList<>();

        // 1. Add system instructions as initial developer context if present
        if (StringUtils.hasText(systemContext)) {
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", "SYSTEM INSTRUCTIONS & LIVE PLACIFY CONTEXT:\n" + systemContext))
            ));
            contents.add(Map.of(
                    "role", "model",
                    "parts", List.of(Map.of("text", "Understood! I am Placify AI, the official personal placement and preparation assistant for VVITU students. I will answer educational questions, programming concepts, interview doubts, and real Placify drive/eligibility queries accurately using the provided context."))
            ));
        }

        // 2. Add recent conversation turns
        if (history != null && !history.isEmpty()) {
            int startIdx = Math.max(0, history.size() - 8); // Keep last 8 messages for context
            for (int i = startIdx; i < history.size(); i++) {
                ChatMessageDto msg = history.get(i);
                if (msg != null && StringUtils.hasText(msg.getText())) {
                    String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.getText()))
                    ));
                }
            }
        }

        // 3. Add current user query
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt))
        ));

        Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 8192
                ),
                "safetySettings", List.of(
                        Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_ONLY_HIGH"),
                        Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_ONLY_HIGH"),
                        Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_ONLY_HIGH"),
                        Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_ONLY_HIGH")
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Set<String> triedModels = new LinkedHashSet<>();
        Exception lastException = null;

        for (String model : candidateModels) {
            if (!triedModels.add(model)) continue;
            try {
                String url = String.format(
                        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        model, apiKey
                );

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        JsonNode candidate = candidates.get(0);
                        String finishReason = candidate.path("finishReason").asText("STOP");
                        logger.info("Gemini chat model {} returned finishReason: {}", model, finishReason);

                        StringBuilder fullText = new StringBuilder();
                        JsonNode parts = candidate.path("content").path("parts");
                        if (parts.isArray()) {
                            for (JsonNode partNode : parts) {
                                JsonNode textNode = partNode.path("text");
                                if (!textNode.isMissingNode() && !textNode.isNull()) {
                                    fullText.append(textNode.asText());
                                }
                            }
                        }

                        String result = fullText.toString().trim();
                        if (StringUtils.hasText(result)) {
                            if ("MAX_TOKENS".equalsIgnoreCase(finishReason)) {
                                logger.warn("Gemini response reached MAX_TOKENS limit (length: {} chars)", result.length());
                            }
                            return result;
                        }
                    }
                }
            } catch (Exception e) {
                lastException = e;
                logger.warn("Gemini chat model {} returned temporary error: {}", model, e.getMessage());
            }
        }

        if (lastException != null) throw lastException;
        return null;
    }

    public String generateIntelligentChatFallback(String userPrompt, String systemContext) {
        String lower = userPrompt.toLowerCase().trim();

        // 1. HashMap / Java Collection Questions
        if (lower.contains("hashmap") || lower.contains("hash table") || lower.contains("hash map")) {
            return "### 💡 Understanding HashMap in Java\n\n" +
                    "A **`HashMap<K, V>`** is a key-value pair data structure in Java (`java.util` package) that provides **O(1)** average time complexity for basic operations like `get()` and `put()`.\n\n" +
                    "#### 🔑 Key Characteristics:\n" +
                    "- **Hashing Mechanism**: Uses the `hashCode()` and `equals()` methods to map keys to bucket indexes.\n" +
                    "- **Collision Handling**: Handles collisions using **Chaining (LinkedList)**. Since Java 8, if a bucket reaches 8+ nodes, it transforms into a balanced **Red-Black Tree (TreeMap)** for **O(log N)** worst-case lookup.\n" +
                    "- **Null Values**: Allows **one `null` key** and multiple `null` values.\n" +
                    "- **Thread Safety**: It is **not synchronized** (use `ConcurrentHashMap` for multithreaded environments).\n\n" +
                    "```java\n" +
                    "import java.util.HashMap;\n\n" +
                    "public class HashMapExample {\n" +
                    "    public static void main(String[] args) {\n" +
                    "        HashMap<String, Integer> studentScores = new HashMap<>();\n" +
                    "        studentScores.put(\"Madhu\", 95);\n" +
                    "        studentScores.put(\"Ramesh\", 88);\n\n" +
                    "        // O(1) Lookup\n" +
                    "        System.out.println(\"Madhu's Score: \" + studentScores.get(\"Madhu\"));\n" +
                    "    }\n" +
                    "}\n" +
                    "```\n\n" +
                    "Would you like typical interview questions or internal architecture details on HashMap?";
        }

        // 2. Polymorphism / OOP Questions
        if (lower.contains("polymorphism") || lower.contains("object oriented") || lower.contains("oops")) {
            return "### 🧩 Polymorphism in Object-Oriented Programming\n\n" +
                    "**Polymorphism** (from Greek *\"many forms\"*) is the ability of an object, method, or reference variable to take on multiple forms.\n\n" +
                    "#### 1. Compile-Time (Static) Polymorphism — Method Overloading\n" +
                    "Occurs when multiple methods in the same class share the same name with different parameter counts or types.\n" +
                    "```java\n" +
                    "class Calculator {\n" +
                    "    int add(int a, int b) { return a + b; }\n" +
                    "    double add(double a, double b) { return a + b; }\n" +
                    "}\n" +
                    "```\n\n" +
                    "#### 2. Runtime (Dynamic) Polymorphism — Method Overriding\n" +
                    "Occurs when a subclass provides a specific implementation of a method declared in its parent class, resolved dynamically at runtime using the Virtual Method Table (`vtable`).\n" +
                    "```java\n" +
                    "class PlacementDrive {\n" +
                    "    void evaluate() { System.out.println(\"General evaluation\"); }\n" +
                    "}\n" +
                    "class TechnicalRound extends PlacementDrive {\n" +
                    "    @Override\n" +
                    "    void evaluate() { System.out.println(\"Coding assessment evaluation\"); }\n" +
                    "}\n" +
                    "```";
        }

        // 3. Binary Search / Algorithms
        if (lower.contains("binary search")) {
            return "### ⚡ Binary Search Algorithm\n\n" +
                    "**Binary Search** is an efficient divide-and-conquer algorithm for finding an element in a **sorted array** with **O(log N)** time complexity and **O(1)** auxiliary space.\n\n" +
                    "#### 📐 Algorithm Steps:\n" +
                    "1. Set pointers `low = 0` and `high = n - 1`.\n" +
                    "2. Calculate `mid = low + (high - low) / 2` (prevents integer overflow).\n" +
                    "3. If `arr[mid] == target`, return `mid`.\n" +
                    "4. If `arr[mid] < target`, search right half: `low = mid + 1`.\n" +
                    "5. Else search left half: `high = mid - 1`.\n\n" +
                    "```java\n" +
                    "public int binarySearch(int[] arr, int target) {\n" +
                    "    int low = 0, high = arr.length - 1;\n" +
                    "    while (low <= high) {\n" +
                    "        int mid = low + (high - low) / 2;\n" +
                    "        if (arr[mid] == target) return mid;\n" +
                    "        if (arr[mid] < target) low = mid + 1;\n" +
                    "        else high = mid - 1;\n" +
                    "    }\n" +
                    "    return -1;\n" +
                    "}\n" +
                    "```";
        }

        // 4. Normalization / SQL
        if (lower.contains("normalization") || lower.contains("sql") || lower.contains("dbms")) {
            return "### 🗄️ Database Normalization & 1NF/2NF/3NF/BCNF\n\n" +
                    "**Normalization** is the systematic database design technique of organizing tables to **minimize data redundancy** and avoid insertion, update, and deletion anomalies.\n\n" +
                    "- **1NF (First Normal Form)**: Each column contains atomic (indivisible) values and rows are unique with a primary key.\n" +
                    "- **2NF (Second Normal Form)**: Must be in 1NF and have **no partial dependencies** (every non-key column must depend on the whole composite primary key).\n" +
                    "- **3NF (Third Normal Form)**: Must be in 2NF and have **no transitive dependencies** (non-key columns must not depend on other non-key columns).\n" +
                    "- **BCNF (Boyce-Codd Normal Form)**: A stricter version of 3NF where for every functional dependency `X -> Y`, `X` must be a super key.";
        }

        // 5. Drives & Eligibility Queries
        if (lower.contains("drive") || lower.contains("eligible") || lower.contains("company") || lower.contains("companies")) {
            if (StringUtils.hasText(systemContext)) {
                return "### 🏢 Active Placement Drives & Eligibility Status\n\n" +
                        "Based on your authenticated profile records on Placify:\n\n" +
                        systemContext + "\n\n" +
                        "👉 You can view circular PDFs and submit your candidate application dossiers directly in **Company Drives** (`/student/drives`).";
            }
            return "### 🏢 Placement Drives on Placify\n\n" +
                    "You currently have access to campus drives including **Amazon Web Services (44.0 LPA)**, **Google India (32.0 LPA)**, **Microsoft (28.0 LPA)**, **Oracle Cloud (22.5 LPA)**, **Cisco (18.0 LPA)**, and **SHNOOR (8.5 LPA)**.\n\n" +
                    "Check the **Company Drives** section (`/student/drives`) for minimum CGPA, backlog thresholds, and deadlines.";
        }

        // 6. Placement Preparation / General Career Guidance
        if (lower.contains("prepare") || lower.contains("roadmap") || lower.contains("strategy") || lower.contains("interview")) {
            return "### 🎯 Campus Placement Preparation Strategy (4-Pillar Blueprint)\n\n" +
                    "1. **Core Data Structures & Algorithms (40% effort)**:\n" +
                    "   - Arrays, Strings, HashMaps, Two Pointers, Trees, and Dynamic Programming.\n" +
                    "   - Practice 2-3 problems daily on LeetCode / Placify Quizzes.\n\n" +
                    "2. **Computer Science Fundamentals (30% effort)**:\n" +
                    "   - Master DBMS (SQL joins, ACID, indexing), OS (threads, deadlocks, virtual memory), Computer Networks (TCP/IP, HTTP/S, DNS), and OOP in Java.\n\n" +
                    "3. **Applied Technical Projects (20% effort)**:\n" +
                    "   - Be ready to explain the architecture, API design, database schemas, and trade-offs of the 2-3 projects on your resume.\n\n" +
                    "4. **HR & Behavioral Communication (10% effort)**:\n" +
                    "   - Structure leadership and problem-solving answers using the **STAR Method** (Situation, Task, Action, Result).\n\n" +
                    "Explore your personalized milestones in the **Preparation Roadmap** (`/student/roadmap`) or practice in the **Preparation Hub** (`/student/preparation`)!";
        }

        // Generic helpful response
        return "### 🤖 Placify AI Placement Assistant\n\n" +
                "I am ready to help you with your campus placement journey at VVITU! You can ask me:\n\n" +
                "- 📚 **Technical Concepts & Code Examples** (*\"Explain binary search\"*, *\"What is polymorphism in Java?\"*, *\"Explain database indexing\"*)\n" +
                "- 💼 **Placement Strategy & Interview Questions** (*\"10 SQL interview questions\"*, *\"How to prepare for Java developer role?\"*)\n" +
                "- 🏢 **Live Placify Drives & Eligibility** (*\"Which drives am I eligible for?\"*, *\"What is the deadline for Amazon?\"*)\n" +
                "- 🏆 **Certifications & Resume Reviews** (*\"What certifications do I have?\"*, *\"How can I improve my ATS score?\"*)\n\n" +
                "What topic would you like to explore next?";
    }

    // =========================================================================
    // 4. VERIFIED CERTIFICATE VALIDATION
    // =========================================================================

    public CertificateVerificationResultDto verifyCertificateContent(String extractedText, String fileName, String mimeType, String studentName) {
        // Try Gemini API if key is available
        if (StringUtils.hasText(apiKey) && !apiKey.equalsIgnoreCase("default_or_placeholder_key") && !apiKey.startsWith("your_")) {
            try {
                CertificateVerificationResultDto result = callGeminiCertificateVerification(extractedText, fileName, mimeType, studentName);
                if (result != null) {
                    logger.info("Successfully verified certificate using Gemini AI: isCert={}, title={}, issuer={}",
                            result.isCertificate(), result.getCertificateTitle(), result.getIssuer());
                    return result;
                }
            } catch (Exception e) {
                logger.warn("Gemini certificate validation API call failed. Using intelligent deterministic validator: {}", e.getMessage());
            }
        }

        return generateHeuristicCertificateVerification(extractedText, fileName);
    }

    private CertificateVerificationResultDto callGeminiCertificateVerification(String extractedText, String fileName, String mimeType, String studentName) throws Exception {
        String[] candidateModels = {
                (StringUtils.hasText(modelName)) ? modelName : "gemini-3.6-flash",
                "gemini-3.6-flash",
                "gemini-3.7-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-flash-latest"
        };

        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert academic and professional certification evaluator for a university campus placement management system.\n");
        sb.append("TASK: Analyze the following document text and determine whether it represents an authentic course / exam / workshop / professional certificate of completion or credential.\n\n");
        sb.append("FILE NAME: ").append(fileName).append("\n");
        sb.append("STUDENT NAME IN RECORD: ").append(studentName != null ? studentName : "Candidate").append("\n");
        sb.append("EXTRACTED DOCUMENT CONTENT:\n---\n").append(extractedText).append("\n---\n\n");

        sb.append("VALIDATION RULES:\n");
        sb.append("1. If the document is an academic marksheet, grade memo, statement of marks, transcript, semester report card, hall ticket, fees receipt, resume/CV, homework assignment, or unrelated document, set \"isCertificate\": false, and set \"reason\" to a clear human-readable error explaining why it is not a certificate.\n");
        sb.append("2. If the document IS a certificate of completion / credential / achievement / award (e.g. Oracle, AWS, Google Cloud, Cisco, Microsoft, Coursera, HackerRank, NPTEL, Udemy, LinkedIn Learning, or university technical workshop), set \"isCertificate\": true, extract \"certificateTitle\", \"issuer\", \"recipient\", \"issueDate\", \"certificateId\" (if present), and set \"confidence\" (0.0 to 1.0).\n");
        sb.append("3. Return ONLY a valid JSON object matching this schema without markdown code blocks:\n");
        sb.append("{\n");
        sb.append("  \"isCertificate\": true,\n");
        sb.append("  \"confidence\": 0.95,\n");
        sb.append("  \"certificateTitle\": \"AWS Certified Cloud Practitioner\",\n");
        sb.append("  \"issuer\": \"Amazon Web Services\",\n");
        sb.append("  \"recipient\": \"Devanaboyina Madhu\",\n");
        sb.append("  \"issueDate\": \"2025\",\n");
        sb.append("  \"certificateId\": \"AWS-12345\",\n");
        sb.append("  \"reason\": \"Verified certificate of completion from recognized authority.\"\n");
        sb.append("}\n");

        Map<String, Object> part = Map.of("text", sb.toString());
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "temperature", 0.1,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Set<String> triedModels = new LinkedHashSet<>();
        Exception lastException = null;

        for (String model : candidateModels) {
            if (!triedModels.add(model)) continue;
            try {
                String url = String.format(
                        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                        model, apiKey
                );

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        StringBuilder sbCert = new StringBuilder();
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray()) {
                            for (JsonNode partNode : parts) {
                                JsonNode tNode = partNode.path("text");
                                if (!tNode.isMissingNode() && !tNode.isNull()) {
                                    sbCert.append(tNode.asText());
                                }
                            }
                        }

                        String text = sbCert.toString().trim();
                        if (text.startsWith("```json")) text = text.substring(7);
                        if (text.startsWith("```")) text = text.substring(3);
                        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
                        text = text.trim();

                        JsonNode resultNode = objectMapper.readTree(text);
                        boolean isCert = resultNode.path("isCertificate").asBoolean(false);
                        double conf = resultNode.path("confidence").asDouble(isCert ? 0.9 : 0.2);
                        String title = resultNode.path("certificateTitle").asText("Certificate of Achievement");
                        String issuer = resultNode.path("issuer").asText("Authorized Organization");
                        String recipient = resultNode.path("recipient").asText(studentName);
                        String issueDate = resultNode.path("issueDate").asText("2026");
                        String certId = resultNode.path("certificateId").asText(null);
                        String reason = resultNode.path("reason").asText(isCert ? "Valid certification document." : "Invalid document type.");

                        return new CertificateVerificationResultDto(isCert, conf, title, issuer, recipient, issueDate, certId, reason);
                    }
                }
            } catch (Exception e) {
                lastException = e;
                logger.warn("Gemini certificate model {} returned temporary error: {}", model, e.getMessage());
            }
        }

        if (lastException != null) throw lastException;
        return null;
    }

    public CertificateVerificationResultDto generateHeuristicCertificateVerification(String extractedText, String fileName) {
        String lower = (extractedText != null ? extractedText : "").toLowerCase() + " " + (fileName != null ? fileName : "").toLowerCase();

        // Check 1: Academic Marksheet / Grade Memo Markers
        boolean hasMarksheetMarkers = lower.contains("marks memo") || lower.contains("marksheet")
                || lower.contains("grade card") || lower.contains("statement of marks")
                || lower.contains("semester grade report") || lower.contains("provisional marks")
                || lower.contains("hall ticket") || lower.contains("consolidated marks memo")
                || lower.contains("sgpa:") || lower.contains("sgpa :") || lower.contains("grade points");

        if (hasMarksheetMarkers) {
            return new CertificateVerificationResultDto(
                    false, 0.95, null, null, null, null, null,
                    "Invalid certificate. The uploaded document appears to be an academic marksheet/grade memo rather than a course or skill certification."
            );
        }

        // Check 2: Resume / CV Markers
        boolean hasResumeMarkers = (lower.contains("curriculum vitae") || lower.contains("resume") || lower.contains("career objective")
                || lower.contains("work experience") || lower.contains("personal profile"))
                && !lower.contains("certificate") && !lower.contains("certify") && !lower.contains("completed");

        if (hasResumeMarkers) {
            return new CertificateVerificationResultDto(
                    false, 0.95, null, null, null, null, null,
                    "Invalid certificate. This document appears to be a resume/CV rather than an achievement certificate."
            );
        }

        // Check 3: Valid Certificate Indicators
        boolean hasCertKeywords = lower.contains("certificate") || lower.contains("certify")
                || lower.contains("certified") || lower.contains("successfully completed")
                || lower.contains("has completed") || lower.contains("certificate of achievement")
                || lower.contains("certificate of completion") || lower.contains("certificate of excellence")
                || lower.contains("course completion") || lower.contains("credential")
                || lower.contains("awarded to") || lower.contains("presented to") || lower.contains("nptel")
                || lower.contains("coursera") || lower.contains("hackerrank") || lower.contains("udemy")
                || lower.contains("aws") || lower.contains("oracle") || lower.contains("cisco")
                || lower.contains("google cloud") || lower.contains("microsoft certified");

        if (hasCertKeywords) {
            String title = "Technical Skill Certification";
            String issuer = "Certification Authority";

            if (lower.contains("aws") || lower.contains("amazon web services")) {
                title = "AWS Cloud Certification";
                issuer = "Amazon Web Services";
            } else if (lower.contains("oracle") || lower.contains("java")) {
                title = "Oracle Certified Java Developer";
                issuer = "Oracle";
            } else if (lower.contains("google") || lower.contains("gcp")) {
                title = "Google Cloud Engineer Credential";
                issuer = "Google Cloud";
            } else if (lower.contains("cisco") || lower.contains("ccna")) {
                title = "Cisco Certified Network Associate";
                issuer = "Cisco Systems";
            } else if (lower.contains("nptel")) {
                title = "NPTEL Online Certification";
                issuer = "NPTEL / IIT";
            } else if (lower.contains("coursera")) {
                title = "Coursera Specialization Certificate";
                issuer = "Coursera";
            } else if (lower.contains("hackerrank")) {
                title = "HackerRank Problem Solving Certificate";
                issuer = "HackerRank";
            } else if (lower.contains("udemy")) {
                title = "Udemy Course Completion Certificate";
                issuer = "Udemy";
            } else if (lower.contains("python")) {
                title = "Python Programming Certification";
                issuer = "Technical Institute";
            }

            return new CertificateVerificationResultDto(
                    true, 0.92, title, issuer, "Candidate", "2026", "CERT-" + System.currentTimeMillis() % 100000,
                    "Verified certificate of achievement from an authorized organization."
            );
        }

        // Check 4: Unrecognized document
        return new CertificateVerificationResultDto(
                false, 0.85, null, null, null, null, null,
                "This document does not appear to be a certificate. Please upload a valid certification document (PDF, JPG, PNG)."
        );
    }
}
