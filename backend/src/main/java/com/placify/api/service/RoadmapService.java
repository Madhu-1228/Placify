package com.placify.api.service;

import com.placify.api.model.*;
import com.placify.api.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    private static final Logger logger = LoggerFactory.getLogger(RoadmapService.class);

    @Autowired
    private PreparationRoadmapRepository roadmapRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private GeminiService geminiService;

    public Optional<PreparationRoadmap> getCurrentRoadmap(String userId) {
        return roadmapRepository.findTopByUserIdOrderByUpdatedAtDesc(userId);
    }

    public PreparationRoadmap generateRoadmap(String userId, String targetRole, String targetDriveId, int durationDays, boolean regenerate) {
        // Find user & profile
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElse(null);

        // Fetch latest resume analysis if available
        ResumeAnalysis latestResume = resumeAnalysisRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        // Fetch target drive if specified
        CompanyDrive targetDrive = null;
        if (StringUtils.hasText(targetDriveId) && !"NONE".equalsIgnoreCase(targetDriveId)) {
            targetDrive = companyDriveRepository.findById(targetDriveId).orElse(null);
        }

        // Aggregate student information
        String studentName = profile != null && StringUtils.hasText(profile.getName()) ? profile.getName() : user.getName();
        String department = profile != null && StringUtils.hasText(profile.getDepartment()) ? profile.getDepartment() : "Information Technology";
        Double cgpa = profile != null && profile.getCgpa() != null ? profile.getCgpa() : 8.0;

        // Current skills from profile + resume
        Set<String> skillsSet = new LinkedHashSet<>();
        if (profile != null && profile.getSkills() != null) {
            skillsSet.addAll(profile.getSkills());
        }
        if (latestResume != null && latestResume.getDetectedSkills() != null) {
            skillsSet.addAll(latestResume.getDetectedSkills());
        }
        List<String> currentSkills = new ArrayList<>(skillsSet);

        // Effective Target Role & Company
        String effectiveRole = StringUtils.hasText(targetRole) ? targetRole : "Java Full Stack Developer";
        String targetCompany = targetDrive != null ? targetDrive.getCompanyName() : null;
        List<String> companyRequirements = targetDrive != null && targetDrive.getRequiredSkills() != null ? targetDrive.getRequiredSkills() : Collections.emptyList();

        if (targetDrive != null && !StringUtils.hasText(targetRole)) {
            effectiveRole = targetDrive.getRole();
        }

        // Valid durations: 7, 14, 30, 60
        int effectiveDuration = (durationDays == 7 || durationDays == 14 || durationDays == 30 || durationDays == 60) ? durationDays : 30;

        // Collect platform resources for grounded curriculum
        List<String> availableResources = resourceRepository.findAll().stream()
                .map(Resource::getTitle)
                .limit(15)
                .collect(Collectors.toList());

        // 1. Try Gemini AI Generation
        PreparationRoadmap roadmap = geminiService.generatePersonalizedRoadmap(
                studentName, department, cgpa, currentSkills, effectiveRole, targetCompany, companyRequirements, effectiveDuration, availableResources
        );

        // 2. Fallback Heuristic Generation if Gemini fails or is rate-limited
        if (roadmap == null || roadmap.getMilestones() == null || roadmap.getMilestones().isEmpty()) {
            roadmap = generateHeuristicRoadmap(
                    studentName, department, cgpa, currentSkills, effectiveRole, targetCompany, companyRequirements, effectiveDuration
            );
            roadmap.setGeneratedBy("HEURISTIC_ENGINE");
        }

        // Attach candidate & metadata
        roadmap.setUserId(userId);
        if (profile != null) {
            roadmap.setStudentId(profile.getId());
            roadmap.setRollNumber(profile.getRollNumber());
            roadmap.setDepartment(profile.getDepartment());
        }
        roadmap.setStudentName(studentName);
        roadmap.setTargetRole(effectiveRole);
        roadmap.setTargetCompany(targetCompany);
        roadmap.setTargetDriveId(targetDrive != null ? targetDrive.getId() : null);
        roadmap.setDurationDays(effectiveDuration);
        roadmap.setCreatedAt(Instant.now());
        roadmap.setUpdatedAt(Instant.now());

        // Recalculate metrics
        roadmap.recalculateMetrics();

        // Save and return
        return roadmapRepository.save(roadmap);
    }

    public PreparationRoadmap updateTaskStatus(String userId, String roadmapId, String taskId, TaskStatus newStatus) {
        PreparationRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Preparation Roadmap not found with ID: " + roadmapId));

        if (!roadmap.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this preparation roadmap.");
        }

        boolean found = false;
        if (roadmap.getMilestones() != null) {
            for (RoadmapMilestone m : roadmap.getMilestones()) {
                if (m.getTasks() != null) {
                    for (RoadmapTask t : m.getTasks()) {
                        if (t.getId().equals(taskId)) {
                            t.setStatus(newStatus);
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
        }

        if (!found) {
            throw new RuntimeException("Task not found with ID: " + taskId);
        }

        roadmap.recalculateMetrics();
        return roadmapRepository.save(roadmap);
    }

    public List<String> getPopularTargetRoles() {
        return Arrays.asList(
                "Java Full Stack Developer",
                "Backend Software Engineer (Java / Spring Boot)",
                "Frontend Web Developer (React.js)",
                "Full Stack Developer (MERN Stack)",
                "Python & AI / Data Science Engineer",
                "Cloud & DevOps Platform Engineer",
                "Mobile App Developer (Flutter / React Native)",
                "Database Administrator & Data Analyst",
                "Cybersecurity & QA Automation Engineer"
        );
    }

    /**
     * Intelligent Heuristic Fallback Roadmap Generator mapped to student skills and target role.
     */
    private PreparationRoadmap generateHeuristicRoadmap(
            String studentName,
            String department,
            Double cgpa,
            List<String> currentSkills,
            String targetRole,
            String targetCompany,
            List<String> companyRequirements,
            int durationDays) {

        PreparationRoadmap roadmap = new PreparationRoadmap();

        // 1. Identify strengths
        List<String> strengths = new ArrayList<>();
        if (currentSkills != null && !currentSkills.isEmpty()) {
            strengths.addAll(currentSkills.subList(0, Math.min(4, currentSkills.size())));
        } else {
            strengths.add("Core Programming Foundations");
            strengths.add("Academic B.Tech Curriculum");
        }
        roadmap.setCurrentStrengths(strengths);

        // 2. Identify skill gaps based on target role & company requirements
        List<SkillGap> skillGaps = new ArrayList<>();
        Set<String> currentLower = currentSkills != null ? currentSkills.stream().map(String::toLowerCase).collect(Collectors.toSet()) : Collections.emptySet();

        String roleLower = targetRole.toLowerCase();

        if (roleLower.contains("java") || roleLower.contains("backend") || roleLower.contains("full stack")) {
            if (!currentLower.contains("spring boot")) {
                skillGaps.add(new SkillGap("Spring Boot & Microservices", SkillPriority.HIGH, "Enterprise industry standard for Java recruitment rounds", "Framework"));
            }
            if (!currentLower.contains("data structures") && !currentLower.contains("dsa")) {
                skillGaps.add(new SkillGap("Data Structures & Algorithms (DSA)", SkillPriority.HIGH, "Essential for clearing technical online coding screening", "Core"));
            }
            if (!currentLower.contains("docker")) {
                skillGaps.add(new SkillGap("Docker Containerization", SkillPriority.MEDIUM, "Crucial for modern cloud deployment interview questions", "DevOps"));
            }
            if (!currentLower.contains("sql") && !currentLower.contains("mongodb")) {
                skillGaps.add(new SkillGap("Database Optimization (SQL / NoSQL)", SkillPriority.HIGH, "Complex query writing and schema design tested in technical rounds", "Database"));
            }
        } else if (roleLower.contains("python") || roleLower.contains("data") || roleLower.contains("ai")) {
            if (!currentLower.contains("pandas") && !currentLower.contains("numpy")) {
                skillGaps.add(new SkillGap("NumPy & Pandas Data Wrangling", SkillPriority.HIGH, "Core requirement for Python data processing assessments", "Data Science"));
            }
            if (!currentLower.contains("scikit-learn") && !currentLower.contains("machine learning")) {
                skillGaps.add(new SkillGap("Machine Learning Algorithms", SkillPriority.HIGH, "Applied ML models frequently tested in technical rounds", "AI / ML"));
            }
        } else {
            skillGaps.add(new SkillGap("Data Structures & Algorithms", SkillPriority.HIGH, "Universal core screening requirement across all Tier-1/Tier-2 drives", "Core"));
            skillGaps.add(new SkillGap("System Design & REST APIs", SkillPriority.MEDIUM, "Evaluated in final technical interview discussions", "Architecture"));
        }

        // Add any unmet company requirements
        if (companyRequirements != null) {
            for (String req : companyRequirements) {
                if (!currentLower.contains(req.toLowerCase()) && skillGaps.stream().noneMatch(g -> g.getSkillName().equalsIgnoreCase(req))) {
                    skillGaps.add(new SkillGap(req, SkillPriority.HIGH, "Mandatory requirement explicitly specified by " + (targetCompany != null ? targetCompany : "recruiter"), "Recruiter Requirement"));
                }
            }
        }

        if (skillGaps.isEmpty()) {
            skillGaps.add(new SkillGap("Advanced System Scalability", SkillPriority.LOW, "Bonus topics to achieve top-tier placement packages", "Advanced"));
        }
        roadmap.setSkillGaps(skillGaps);

        // 3. Generate Milestones based on duration
        List<RoadmapMilestone> milestones = new ArrayList<>();
        int weeks = Math.max(1, durationDays / 7);

        // Milestone 1: DSA Foundations & Screening Mastery
        RoadmapMilestone m1 = new RoadmapMilestone();
        m1.setMilestoneNumber("WEEK 1");
        m1.setTitle("DSA Foundations & Coding Round Mastery");
        m1.setFocusArea("Data Structures & Algorithms");
        m1.setLearningObjective("Solve standard array, string, and hashing problems with optimal O(N) complexity.");
        m1.setTasks(Arrays.asList(
                new RoadmapTask("Arrays & Two-Pointers Practice", "Solve 5 classic Two-Pointer and Sliding Window problems", "PRACTICE", "DSA Placement Cheat Sheet", "/student/preparation", 90),
                new RoadmapTask("HashMaps & Frequency Counting", "Implement collision handling and anagram/subarray frequency counters", "CONCEPT", "DSA Key Concepts", "/student/preparation", 60),
                new RoadmapTask("Aptitude Quantitative Screening Test", "Attempt speed quantitative quiz on Time-Speed-Distance & Percentages", "ASSESSMENT", "Aptitude Assessment Quiz", "/student/quizzes", 45)
        ));
        milestones.add(m1);

        // Milestone 2: Core Frameworks & Architecture
        RoadmapMilestone m2 = new RoadmapMilestone();
        m2.setMilestoneNumber("WEEK 2");
        m2.setTitle("Backend Architecture & Spring Boot APIs");
        m2.setFocusArea("Frameworks & REST API Design");
        m2.setLearningObjective("Build resilient RESTful web services with validation, exception handling, and database persistence.");
        m2.setTasks(Arrays.asList(
                new RoadmapTask("Spring Boot Dependency Injection & Annotations", "Study @RestController, @Service, @Autowired lifecycle and Bean scopes", "CONCEPT", "Java & Spring Master Notes", "/student/preparation", 60),
                new RoadmapTask("Database Repositories & JPA Queries", "Implement relational or MongoDB repositories with pagination and custom query methods", "PRACTICE", "DBMS Formula & Interview Sheet", "/student/preparation", 75),
                new RoadmapTask("Spring Boot REST Microservice Practice Quiz", "Take timed assessment on HTTP status codes and Spring annotations", "ASSESSMENT", "Java Placement Assessment", "/student/quizzes", 30)
        ));
        milestones.add(m2);

        // Milestone 3: Full Stack & System Projects (if >= 3 weeks)
        if (weeks >= 3) {
            RoadmapMilestone m3 = new RoadmapMilestone();
            m3.setMilestoneNumber("WEEK 3");
            m3.setTitle("Full Stack Project & Cloud Deployment");
            m3.setFocusArea("Application Portfolio & Docker");
            m3.setLearningObjective("Integrate frontend components with backend endpoints and containerize with Docker.");
            m3.setTasks(Arrays.asList(
                    new RoadmapTask("Containerize Backend with Dockerfile", "Write multi-stage Dockerfile and test image run locally on port 8080", "PRACTICE", "DevOps & Cloud Notes", "/student/preparation", 60),
                    new RoadmapTask("Implement JWT Security & Authentication", "Secure endpoints with stateless JWT token headers and BCrypt password encryption", "CONCEPT", "Full Stack Placement Guide", "/student/preparation", 75)
            ));
            milestones.add(m3);
        }

        // Milestone 4: Mock Technical & HR Interviews (if >= 4 weeks)
        if (weeks >= 4) {
            RoadmapMilestone m4 = new RoadmapMilestone();
            m4.setMilestoneNumber("WEEK 4");
            m4.setTitle("Mock Technical & HR Interview Rehearsals");
            m4.setFocusArea("Live Coding & Behavioral HR");
            m4.setLearningObjective("Synthesize projects, explain architectural decisions, and answer STAR-method behavioral questions.");
            m4.setTasks(Arrays.asList(
                    new RoadmapTask("STAR Method Project Walkthrough Rehearsal", "Prepare 2-minute elevator pitch and technical challenges solved for your top projects", "INTERVIEW", "Interview Master Notes", "/student/preparation", 45),
                    new RoadmapTask("Comprehensive Placement Mock Assessment", "Attempt full-length comprehensive mock exam covering Aptitude, Core Java, and DSA", "ASSESSMENT", "Full Mock Placement Quiz", "/student/quizzes", 60),
                    new RoadmapTask("AI Resume ATS Scoring Re-Check", "Re-scan updated resume to verify ATS score above 85%", "PRACTICE", "AI Resume Analyzer", "/student/resume-analyzer", 15)
            ));
            milestones.add(m4);
        }

        roadmap.setMilestones(milestones);
        roadmap.setAdaptiveAdvice(
                "Prioritize " + (skillGaps.isEmpty() ? "DSA practice" : skillGaps.get(0).getSkillName()) +
                " as it represents the highest-weighted evaluation criterion for " + targetRole + " hiring rounds."
        );

        return roadmap;
    }
}
