package com.placify.api.service;

import com.placify.api.model.*;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.repository.NotificationRepository;
import com.placify.api.repository.QuizRepository;
import com.placify.api.repository.ResourceRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class DataInitializerService {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializerService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${placify.admin.defaultEmail:vvitu@cds.edu}")
    private String defaultAdminEmail;

    @Value("${placify.admin.defaultPassword:Admin@123456}")
    private String defaultAdminPassword;

    @Value("${placify.admin.defaultName:VVITU CDS}")
    private String defaultAdminName;

    @PostConstruct
    public void initializeDevelopmentData() {
        // 1. Seed Placement Officer / Administrator Account: VVITU CDS (vvitu@cds.edu)
        Optional<User> existingAdmin = userRepository.findByEmailIgnoreCase(defaultAdminEmail)
                .or(() -> userRepository.findByEmailIgnoreCase("admin@placify.edu"))
                .or(() -> userRepository.findByUsernameIgnoreCase("admin"))
                .or(() -> userRepository.findByUsernameIgnoreCase("VVITU_CDS"));

        User admin;
        if (existingAdmin.isEmpty()) {
            admin = new User(
                    defaultAdminName,
                    defaultAdminEmail,
                    "VVITU_CDS",
                    passwordEncoder.encode(defaultAdminPassword),
                    Role.ADMIN
            );
            admin.setCreatedAt(Instant.now());
            admin.setUpdatedAt(Instant.now());
        } else {
            admin = existingAdmin.get();
            admin.setName(defaultAdminName);
            admin.setEmail(defaultAdminEmail);
            admin.setUsername("VVITU_CDS");
            admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
            admin.setRole(Role.ADMIN);
            admin.setUpdatedAt(Instant.now());
        }
        userRepository.save(admin);
        logger.info("Configured Placement Officer / Administrator account: {} ({})", defaultAdminName, defaultAdminEmail);

        // 2. Seed Student Demo Account: Devanaboyina Madhu (Username: MadhuD, Pass: Madhu@300526)
        seedStudentAccount();

        // 3. Seed 50 realistic student candidate directory records
        seedFiftyDiverseStudents();

        // 4. Seed initial preparation resources if empty
        if (resourceRepository.count() == 0) {
            seedSampleResources();
            logger.info("Seeded initial placement preparation resources.");
        }

        // 5. Seed initial quizzes if empty
        if (quizRepository.count() == 0) {
            seedSampleQuizzes();
            logger.info("Seeded initial placement quizzes.");
        }

        // 6. Seed or augment diverse company drives across OPEN, UPCOMING, and COMPLETED
        seedSampleCompanyDrives();
    }

    private void seedStudentAccount() {
        String studentEmail = "23BQ1A1228@vvit.net";
        String username = "MadhuD";
        String password = "Madhu@300526";

        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(studentEmail)
                .or(() -> userRepository.findByUsernameIgnoreCase(username))
                .or(() -> userRepository.findByEmailIgnoreCase("madhud@placify.edu"));

        User userToSave;
        if (existingUser.isEmpty()) {
            userToSave = new User(
                    "Devanaboyina Madhu",
                    studentEmail,
                    username,
                    passwordEncoder.encode(password),
                    Role.STUDENT
            );
            userToSave.setCreatedAt(Instant.now());
            userToSave.setUpdatedAt(Instant.now());
        } else {
            userToSave = existingUser.get();
            userToSave.setName("Devanaboyina Madhu");
            userToSave.setEmail(studentEmail);
            userToSave.setUsername(username);
            userToSave.setPassword(passwordEncoder.encode(password));
            userToSave.setUpdatedAt(Instant.now());
        }
        final User savedUser = userRepository.save(userToSave);
        logger.info("Configured student demo user: {} ({}) with email {}", savedUser.getName(), username, studentEmail);

        // Create or update StudentProfile
        Optional<StudentProfile> existingProfile = studentProfileRepository.findByUserId(savedUser.getId());
        StudentProfile profile;
        if (existingProfile.isPresent()) {
            profile = existingProfile.get();
            // Preserve existing certifications, skills, and user profile data!
            if (profile.getCertifications() == null) {
                profile.setCertifications(new ArrayList<>());
                studentProfileRepository.save(profile);
            }
            logger.info("Preserved existing student profile and {} certifications for Devanaboyina Madhu",
                    profile.getCertifications().size());
        } else {
            profile = new StudentProfile(savedUser.getId(), savedUser.getName(), savedUser.getEmail());
            profile.setName("Devanaboyina Madhu");
            profile.setEmail(studentEmail);
            profile.setRollNumber("23BQ1A1228");
            profile.setDepartment("Information Technology");
            profile.setSection("A");
            profile.setYear(3);
            profile.setSemester(6);
            profile.setCgpa(8.85);
            profile.setBacklogs(0);
            profile.setPhone("+91 98765 43210");
            profile.setSkills(new ArrayList<>(Arrays.asList("Java", "Spring Boot", "React", "MongoDB", "SQL", "Data Structures", "Python")));
            profile.setProjects(new ArrayList<>(Arrays.asList(
                    new Project("PLACIFY Platform", "Intelligent placement preparation and recruitment tracking full-stack system", "React, Spring Boot, MongoDB", "https://github.com/MadhuD/placify"),
                    new Project("Cloud AI Analyzer", "Resume and document evaluation platform using Google Gemini API", "Java, Gemini AI, React", "https://github.com/MadhuD/cloud-ai")
            )));
            profile.setCertifications(new ArrayList<>(Arrays.asList(
                    new Certification("AWS Certified Cloud Practitioner", "Amazon Web Services", "2025", "https://aws.amazon.com/certification"),
                    new Certification("Oracle Certified Java SE Developer", "Oracle", "2024", "https://oracle.com/cert")
            )));
            profile.setGithubUrl("https://github.com/MadhuD");
            profile.setLinkedinUrl("https://linkedin.com/in/devanaboyina-madhu");
            profile.setResumeUrl("/uploads/resumes/Devanaboyina_Madhu_Resume.pdf");
            profile.setProfileCompletionPercentage(95);
            profile.setCreatedAt(Instant.now());
            profile.setUpdatedAt(Instant.now());

            studentProfileRepository.save(profile);
            logger.info("Configured initial student profile for Devanaboyina Madhu (23BQ1A1228 - Information Technology)");
        }

        // Seed rich drive circular notifications with WhatsApp circulars and documents
        seedDriveCircularNotifications(savedUser.getId());
    }

    private void seedSampleResources() {
        Resource r1 = new Resource();
        r1.setTitle("Data Structures & Algorithms - Top 75 Coding Problems");
        r1.setDescription("Curated collection of essential coding interview questions covering Arrays, Trees, Graphs, Dynamic Programming, and Binary Search.");
        r1.setCategory("DSA");
        r1.setDifficulty(DifficultyLevel.MEDIUM);
        r1.setResourceType("PDF");
        r1.setUrl("https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions");
        r1.setTags(Arrays.asList("DSA", "Coding", "Algorithms", "LeetCode", "Interview"));
        r1.setCreatedBy("Admin");
        r1.setCreatedAt(Instant.now());
        r1.setUpdatedAt(Instant.now());

        Resource r2 = new Resource();
        r2.setTitle("Core Java & Spring Boot Interview Master Guide");
        r2.setDescription("Comprehensive notes on Java 17+, Multithreading, JVM Memory Management, Spring MVC, Spring Data, and RESTful Microservices.");
        r2.setCategory("Java");
        r2.setDifficulty(DifficultyLevel.HARD);
        r2.setResourceType("ARTICLE");
        r2.setContent("Key Java Concepts:\n1. OOPs Principles: Encapsulation, Inheritance, Polymorphism, Abstraction\n2. Java Memory Model: Heap, Stack, Metaspace, GC algorithms\n3. Collections Framework: HashMap collision resolution (Red-Black trees), ConcurrentHashMap\n4. Spring Boot: Dependency Injection, Auto-configuration, SecurityFilterChain, Transaction Management.");
        r2.setTags(Arrays.asList("Java", "Spring Boot", "OOP", "Backend"));
        r2.setCreatedBy("Admin");
        r2.setCreatedAt(Instant.now());
        r2.setUpdatedAt(Instant.now());

        Resource r3 = new Resource();
        r3.setTitle("DBMS, SQL & Indexing Cheat Sheet");
        r3.setDescription("Relational database design, Normalization (1NF to BCNF), ACID properties, Transactions, Joins, and B-Tree indexing strategies.");
        r3.setCategory("DBMS");
        r3.setDifficulty(DifficultyLevel.MEDIUM);
        r3.setResourceType("PDF");
        r3.setTags(Arrays.asList("DBMS", "SQL", "Database", "Indexing"));
        r3.setCreatedBy("Admin");
        r3.setCreatedAt(Instant.now());
        r3.setUpdatedAt(Instant.now());

        Resource r4 = new Resource();
        r4.setTitle("Quantitative Aptitude & Logical Reasoning Formulas");
        r4.setDescription("Fast calculation tricks, Probability, Permutations, Time & Work, Speed Distance, Syllogisms, and Data Interpretation for online assessments.");
        r4.setCategory("Aptitude");
        r4.setDifficulty(DifficultyLevel.EASY);
        r4.setResourceType("PDF");
        r4.setTags(Arrays.asList("Aptitude", "Quantitative", "Logical", "Placement Test"));
        r4.setCreatedBy("Admin");
        r4.setCreatedAt(Instant.now());
        r4.setUpdatedAt(Instant.now());

        resourceRepository.saveAll(Arrays.asList(r1, r2, r3, r4));
    }

    private void seedSampleQuizzes() {
        Quiz q1 = new Quiz();
        q1.setTitle("Java Core & OOPs Assessment");
        q1.setCategory("Java");
        q1.setDifficulty(DifficultyLevel.MEDIUM);
        q1.setTimeLimitMinutes(10);
        q1.setCreatedBy("Admin");
        q1.setCreatedAt(Instant.now());
        q1.setUpdatedAt(Instant.now());

        Question q1_1 = new Question(1, "What happens when a HashMap reaches its load factor threshold?",
                Arrays.asList(
                        "It throws OutOfMemoryError",
                        "Its capacity is doubled and keys are rehashed",
                        "Old keys are evicted based on LRU",
                        "New keys are converted to LinkedList only"
                ), 1, "When the number of entries exceeds threshold (capacity * load factor), HashMap doubles its internal table size and re-hashes existing elements.");

        Question q1_2 = new Question(2, "Which interface is used to define natural sorting order in Java?",
                Arrays.asList("java.util.Comparator", "java.lang.Comparable", "java.lang.Cloneable", "java.util.Sorted"),
                1, "Comparable<T> provides the compareTo method defining the natural ordering of objects.");

        Question q1_3 = new Question(3, "In Spring Boot, which annotation enables Spring Data MongoDB auditing?",
                Arrays.asList("@EnableMongoRepositories", "@EnableMongoAuditing", "@EnableTransactionManagement", "@EnableAutoConfiguration"),
                1, "@EnableMongoAuditing activates auditing annotations such as @CreatedDate and @LastModifiedDate.");

        q1.setQuestions(Arrays.asList(q1_1, q1_2, q1_3));

        Quiz q2 = new Quiz();
        q2.setTitle("Data Structures & Complexity Essentials");
        q2.setCategory("DSA");
        q2.setDifficulty(DifficultyLevel.EASY);
        q2.setTimeLimitMinutes(10);
        q2.setCreatedBy("Admin");
        q2.setCreatedAt(Instant.now());
        q2.setUpdatedAt(Instant.now());

        Question q2_1 = new Question(1, "What is the average time complexity of searching in a Balanced Binary Search Tree?",
                Arrays.asList("O(1)", "O(log N)", "O(N)", "O(N log N)"),
                1, "In a balanced BST like AVL or Red-Black Tree, height is logarithmic, giving O(log N) search time.");

        Question q2_2 = new Question(2, "Which data structure is fundamentally used in Breadth-First Search (BFS)?",
                Arrays.asList("Stack", "Queue", "Priority Queue", "HashMap"),
                1, "BFS explores level by level using a FIFO Queue.");

        q2.setQuestions(Arrays.asList(q2_1, q2_2));

        quizRepository.saveAll(Arrays.asList(q1, q2));
    }

    private void seedSampleCompanyDrives() {
        Optional<CompanyDrive> existingShnoor = companyDriveRepository.findAll().stream()
                .filter(d -> "SHNOOR".equalsIgnoreCase(d.getCompanyName()))
                .findFirst();

        CompanyDrive shnoor = existingShnoor.orElseGet(CompanyDrive::new);
        shnoor.setCompanyName("SHNOOR");
        shnoor.setRole("Associate Software Engineer / Technical Analyst");
        shnoor.setJobDescription("SHNOOR Assessment & Recruitment Drive. Online coding, technical aptitude, and problem-solving assessment on the SHNOOR Assessment Portal (https://assessments.shnoor.com) followed by technical interviews.");
        shnoor.setPackageCtc("8.5 LPA");
        shnoor.setLocation("Hyderabad");
        shnoor.setDriveDate("2026-08-08");
        shnoor.setApplicationDeadline("2026-08-07 (4:00 PM Sharp)");
        shnoor.setMinimumCgpa(6.5);
        shnoor.setMaximumBacklogs(1);
        shnoor.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Artificial Intelligence and Data Science", "Electronics and Communication Engineering"));
        shnoor.setEligibleYears(Arrays.asList(3, 4, 2026));
        shnoor.setRequiredSkills(Arrays.asList("Java", "Python", "Data Structures", "SQL", "Quantitative Aptitude"));
        shnoor.setSelectionRounds(Arrays.asList("SHNOOR Online Assessment Portal", "Technical Interview Round", "HR Round"));
        shnoor.setStatus(DriveStatus.COMPLETED);
        shnoor.setCreatedBy("Admin");
        if (shnoor.getCreatedAt() == null) shnoor.setCreatedAt(Instant.now());
        shnoor.setUpdatedAt(Instant.now());
        companyDriveRepository.save(shnoor);
        logger.info("Updated SHNOOR completed company drive with location: Hyderabad.");

        // Only seed general templates if empty
        if (companyDriveRepository.count() >= 6) {
            return;
        }

        // 1. OPEN Drives
        CompanyDrive d1 = new CompanyDrive();
        d1.setCompanyName("Google India");
        d1.setRole("Software Engineer - Early Career");
        d1.setJobDescription("Build large-scale distributed systems, collaborate on modern cloud infrastructure, and develop innovative software solutions.");
        d1.setPackageCtc("32.5 LPA");
        d1.setLocation("Bangalore / Hyderabad");
        d1.setDriveDate("2026-09-20");
        d1.setApplicationDeadline("2026-09-15");
        d1.setMinimumCgpa(8.0);
        d1.setMaximumBacklogs(0);
        d1.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Artificial Intelligence and Data Science"));
        d1.setEligibleYears(Arrays.asList(3, 4, 2026));
        d1.setRequiredSkills(Arrays.asList("Java", "Data Structures", "Algorithms", "System Design", "C++"));
        d1.setSelectionRounds(Arrays.asList("Online Coding Assessment", "Technical Interview Round 1", "Technical Interview Round 2", "Googliness & Leadership"));
        d1.setStatus(DriveStatus.OPEN);
        d1.setCreatedBy("Admin");
        d1.setCreatedAt(Instant.now());
        d1.setUpdatedAt(Instant.now());

        CompanyDrive d2 = new CompanyDrive();
        d2.setCompanyName("Microsoft");
        d2.setRole("Software Development Engineer (SDE-1)");
        d2.setJobDescription("Design, build, and deploy enterprise-grade cloud applications and services on Azure.");
        d2.setPackageCtc("28.0 LPA");
        d2.setLocation("Hyderabad / Noida");
        d2.setDriveDate("2026-09-25");
        d2.setApplicationDeadline("2026-09-18");
        d2.setMinimumCgpa(7.5);
        d2.setMaximumBacklogs(0);
        d2.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering"));
        d2.setEligibleYears(Arrays.asList(3, 4, 2026));
        d2.setRequiredSkills(Arrays.asList("Java", "React", "SQL", "Data Structures"));
        d2.setSelectionRounds(Arrays.asList("Online Test", "Technical Interview", "System Design Round", "HR Round"));
        d2.setStatus(DriveStatus.OPEN);
        d2.setCreatedBy("Admin");
        d2.setCreatedAt(Instant.now());
        d2.setUpdatedAt(Instant.now());

        CompanyDrive d3 = new CompanyDrive();
        d3.setCompanyName("Amazon Web Services");
        d3.setRole("Cloud Support Associate");
        d3.setJobDescription("Build, troubleshoot, and optimize distributed cloud architectures and systems on AWS.");
        d3.setPackageCtc("19.5 LPA");
        d3.setLocation("Bangalore / Hyderabad");
        d3.setDriveDate("2026-10-15");
        d3.setApplicationDeadline("2026-10-05");
        d3.setMinimumCgpa(7.0);
        d3.setMaximumBacklogs(0);
        d3.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering"));
        d3.setEligibleYears(Arrays.asList(3, 4, 2026));
        d3.setRequiredSkills(Arrays.asList("Java", "Linux", "Networking", "AWS"));
        d3.setSelectionRounds(Arrays.asList("Online Assessment", "Technical Interview", "Bar Raiser Interview"));
        d3.setStatus(DriveStatus.OPEN);
        d3.setCreatedBy("Admin");
        d3.setCreatedAt(Instant.now());
        d3.setUpdatedAt(Instant.now());

        // 2. UPCOMING Drives
        CompanyDrive d4 = new CompanyDrive();
        d4.setCompanyName("Goldman Sachs");
        d4.setRole("Summer Technology Analyst / SDE");
        d4.setJobDescription("Develop high-frequency trading platforms, quantitative financial algorithms, and mission-critical enterprise microservices.");
        d4.setPackageCtc("30.0 LPA");
        d4.setLocation("Bangalore / Hyderabad");
        d4.setDriveDate("2026-11-10");
        d4.setApplicationDeadline("2026-10-30");
        d4.setMinimumCgpa(7.5);
        d4.setMaximumBacklogs(0);
        d4.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Artificial Intelligence and Data Science", "Electronics and Communication Engineering"));
        d4.setEligibleYears(Arrays.asList(3, 4, 2026));
        d4.setRequiredSkills(Arrays.asList("Java", "C++", "Data Structures", "Algorithms", "SQL"));
        d4.setSelectionRounds(Arrays.asList("Hackerrank Aptitude & Math Test", "Technical Interview 1", "Technical Interview 2", "Hiring Committee Review"));
        d4.setStatus(DriveStatus.UPCOMING);
        d4.setCreatedBy("Admin");
        d4.setCreatedAt(Instant.now());
        d4.setUpdatedAt(Instant.now());

        CompanyDrive d5 = new CompanyDrive();
        d5.setCompanyName("Oracle Cloud Infrastructure");
        d5.setRole("Member of Technical Staff (MTS)");
        d5.setJobDescription("Design resilient cloud database engines, distributed storage systems, and next-generation IaaS microservices.");
        d5.setPackageCtc("22.5 LPA");
        d5.setLocation("Bangalore / Hyderabad / Pune");
        d5.setDriveDate("2026-11-25");
        d5.setApplicationDeadline("2026-11-10");
        d5.setMinimumCgpa(7.0);
        d5.setMaximumBacklogs(0);
        d5.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering"));
        d5.setEligibleYears(Arrays.asList(3, 4, 2026));
        d5.setRequiredSkills(Arrays.asList("Java", "DBMS", "Operating Systems", "SQL", "Linux"));
        d5.setSelectionRounds(Arrays.asList("Online Coding Assessment", "System Architecture Round", "Technical Interview", "HR Interview"));
        d5.setStatus(DriveStatus.UPCOMING);
        d5.setCreatedBy("Admin");
        d5.setCreatedAt(Instant.now());
        d5.setUpdatedAt(Instant.now());

        CompanyDrive d6 = new CompanyDrive();
        d6.setCompanyName("Cisco Systems");
        d6.setRole("Software Engineer - Network & Cloud Security");
        d6.setJobDescription("Build enterprise cybersecurity platforms, automated network protocols, and secure cloud networking solutions.");
        d6.setPackageCtc("18.0 LPA");
        d6.setLocation("Bangalore / Chennai");
        d6.setDriveDate("2026-12-05");
        d6.setApplicationDeadline("2026-11-20");
        d6.setMinimumCgpa(7.0);
        d6.setMaximumBacklogs(0);
        d6.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering", "Electrical and Electronics Engineering"));
        d6.setEligibleYears(Arrays.asList(3, 4, 2026));
        d6.setRequiredSkills(Arrays.asList("Java", "Python", "Computer Networks", "Linux", "Security"));
        d6.setSelectionRounds(Arrays.asList("Cisco Ideathon / Online Test", "Technical Interview Round 1", "Managerial Interview", "HR Round"));
        d6.setStatus(DriveStatus.UPCOMING);
        d6.setCreatedBy("Admin");
        d6.setCreatedAt(Instant.now());
        d6.setUpdatedAt(Instant.now());

        // 3. COMPLETED / CLOSED Drives
        CompanyDrive d7 = new CompanyDrive();
        d7.setCompanyName("Tata Consultancy Services");
        d7.setRole("TCS Prime & Digital Engineer");
        d7.setJobDescription("Full-stack enterprise application engineering, cloud migration, and AI integration services.");
        d7.setPackageCtc("9.0 LPA");
        d7.setLocation("Pan India / Hybrid");
        d7.setDriveDate("2026-08-10");
        d7.setApplicationDeadline("2026-08-01");
        d7.setMinimumCgpa(6.5);
        d7.setMaximumBacklogs(1);
        d7.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Mechanical Engineering", "Civil Engineering"));
        d7.setEligibleYears(Arrays.asList(3, 4, 2026));
        d7.setRequiredSkills(Arrays.asList("Java", "SQL", "OOP"));
        d7.setSelectionRounds(Arrays.asList("TCS NQT Assessment", "Technical Interview", "HR Interview"));
        d7.setStatus(DriveStatus.COMPLETED);
        d7.setCreatedBy("Admin");
        d7.setCreatedAt(Instant.now());
        d7.setUpdatedAt(Instant.now());

        CompanyDrive d8 = new CompanyDrive();
        d8.setCompanyName("SHNOOR");
        d8.setRole("Associate Software Engineer / Technical Analyst");
        d8.setJobDescription("SHNOOR Online Assessment Drive at VVITU Campus. Online coding, technical aptitude, and problem-solving assessment on the SHNOOR Assessment Portal (https://assessments.shnoor.com) followed by technical interviews.");
        d8.setPackageCtc("8.5 LPA");
        d8.setLocation("VVITU Campus / Hyderabad");
        d8.setDriveDate("2026-08-08");
        d8.setApplicationDeadline("2026-08-07 (4:00 PM Sharp)");
        d8.setMinimumCgpa(6.5);
        d8.setMaximumBacklogs(1);
        d8.setEligibleDepartments(Arrays.asList("Computer Science and Engineering", "Information Technology", "Artificial Intelligence and Data Science", "Electronics and Communication Engineering"));
        d8.setEligibleYears(Arrays.asList(3, 4, 2026));
        d8.setRequiredSkills(Arrays.asList("Java", "Python", "Data Structures", "SQL", "Quantitative Aptitude"));
        d8.setSelectionRounds(Arrays.asList("Online Assessment on SHNOOR Portal", "Technical Interview Round", "HR Round"));
        d8.setStatus(DriveStatus.COMPLETED);
        d8.setCreatedBy("Admin");
        d8.setCreatedAt(Instant.now());
        d8.setUpdatedAt(Instant.now());

        if (!companyDriveRepository.existsByCompanyNameIgnoreCase("SHNOOR")) {
            companyDriveRepository.save(d8);
        }

        companyDriveRepository.saveAll(Arrays.asList(d1, d2, d3, d4, d5, d6, d7, d8));
        logger.info("Seeded comprehensive placement drives across OPEN, UPCOMING, and COMPLETED statuses (including SHNOOR).");
    }

    private void seedFiftyDiverseStudents() {
        Object[][] rawStudents = new Object[][] {
            {"Devanaboyina Madhu", "23BQ1A1228", "Information Technology", "A", 3, 6, 9.20, 0, "+91 99887 76655", "Java, Spring Boot, React, MongoDB, AWS"},
            {"Kiran Kumar Reddy", "23BQ1A0501", "Computer Science and Engineering", "A", 4, 7, 9.45, 0, "+91 98480 12345", "Java, DSA, Python, Docker, Kubernetes"},
            {"Ananya Sharma", "23BQ1A0502", "Computer Science and Engineering", "A", 4, 7, 9.60, 0, "+91 98480 23456", "C++, DSA, System Design, React, Node.js"},
            {"Sai Teja Varma", "23BQ1A1202", "Information Technology", "A", 3, 6, 8.85, 0, "+91 98480 34567", "Python, Django, React, PostgreSQL, Cloud"},
            {"Pooja Nandini", "23BQ1A5401", "Artificial Intelligence and Data Science", "A", 4, 7, 9.10, 0, "+91 98480 45678", "Machine Learning, PyTorch, Python, NLP, SQL"},
            {"Rohit Krishna", "23BQ1A0503", "Computer Science and Engineering", "B", 4, 7, 8.75, 0, "+91 98480 56789", "Java, Microservices, Spring Boot, Kafka, MySQL"},
            {"Bhavana Chowdary", "23BQ1A1203", "Information Technology", "A", 3, 6, 9.30, 0, "+91 98480 67890", "Full Stack MERN, React, TypeScript, Next.js"},
            {"Manish Varma", "23BQ1A0401", "Electronics and Communication Engineering", "A", 4, 7, 8.40, 0, "+91 98480 78901", "Embedded C, IoT, Python, Verilog, DSP"},
            {"Deepika Rani", "23BQ1A0504", "Computer Science and Engineering", "A", 4, 7, 9.50, 0, "+91 98480 89012", "Java, Spring Boot, Angular, Oracle, CI/CD"},
            {"Karthik Raju", "23BQ1A5402", "Artificial Intelligence and Data Science", "A", 3, 6, 8.90, 0, "+91 98480 90123", "Deep Learning, Computer Vision, OpenCV, Python"},
            {"Sravani Lakshmi", "23BQ1A1204", "Information Technology", "B", 4, 7, 8.65, 0, "+91 98765 11223", "React Native, Mobile Dev, Flutter, Firebase"},
            {"Venkata Sai", "23BQ1A0505", "Computer Science and Engineering", "B", 3, 6, 8.20, 1, "+91 98765 22334", "Java, Core OOP, SQL, Data Structures"},
            {"Meghana Priya", "23BQ1A0506", "Computer Science and Engineering", "A", 4, 7, 9.70, 0, "+91 98765 33445", "Algorithms, C++, Golang, Cloud Architecture"},
            {"Tarun Adithya", "23BQ1A0402", "Electronics and Communication Engineering", "A", 3, 6, 8.10, 0, "+91 98765 44556", "VLSI, Embedded Systems, Python, Microcontrollers"},
            {"Divya Sri", "23BQ1A1205", "Information Technology", "A", 4, 7, 8.95, 0, "+91 98765 55667", "Cloud Computing, AWS, Terraform, Python, Linux"},
            {"Harsha Vardhan", "23BQ1A0507", "Computer Science and Engineering", "C", 3, 6, 7.80, 1, "+91 98765 66778", "Web Dev, HTML, CSS, JavaScript, MySQL"},
            {"Pallavi Reddy", "23BQ1A5403", "Artificial Intelligence and Data Science", "B", 4, 7, 9.15, 0, "+91 98765 77889", "Data Science, Pandas, PowerBI, SQL, Python"},
            {"Naveen Chandra", "23BQ1A0508", "Computer Science and Engineering", "B", 4, 7, 8.50, 0, "+91 98765 88990", "Cyber Security, Ethical Hacking, Linux, Cryptography"},
            {"Keerthi Suresh", "23BQ1A1206", "Information Technology", "B", 3, 6, 9.05, 0, "+91 98765 99001", "Java, Spring Cloud, Redis, PostgreSQL"},
            {"Goutham Krishna", "23BQ1A0201", "Electrical and Electronics Engineering", "A", 4, 7, 8.30, 0, "+91 91234 56780", "Power Systems, MATLAB, C Programming, IoT"},
            {"Sireesha Devi", "23BQ1A0509", "Computer Science and Engineering", "A", 4, 7, 9.35, 0, "+91 91234 56781", "UI/UX, Figma, React, Tailwind CSS, Frontend"},
            {"Pranith Kumar", "23BQ1A0510", "Computer Science and Engineering", "B", 3, 6, 7.95, 0, "+91 91234 56782", "Python, Flask, REST APIs, SQLite"},
            {"Yamini Reddy", "23BQ1A1207", "Information Technology", "A", 4, 7, 9.25, 0, "+91 91234 56783", "Blockchain, Solidity, Smart Contracts, Web3"},
            {"Akhil Royal", "23BQ1A0403", "Electronics and Communication Engineering", "B", 4, 7, 8.60, 0, "+91 91234 56784", "Signal Processing, MATLAB, C++, Wireless Networks"},
            {"Snigdha Rao", "23BQ1A5404", "Artificial Intelligence and Data Science", "A", 3, 6, 9.40, 0, "+91 91234 56785", "Generative AI, LLMs, LangChain, Python, Vector DBs"},
            {"Manoj Prabhakar", "23BQ1A0301", "Mechanical Engineering", "A", 4, 7, 8.15, 0, "+91 91234 56786", "AutoCAD, SolidWorks, Python for Engg, Finite Elements"},
            {"Kavya Sri", "23BQ1A0511", "Computer Science and Engineering", "A", 4, 7, 8.80, 0, "+91 91234 56787", "Java, Selenium, TestNG, Automation, QA"},
            {"Lokesh Babu", "23BQ1A1208", "Information Technology", "B", 3, 6, 7.65, 2, "+91 91234 56788", "C, C++, Data Structures, Database Fundamentals"},
            {"Aishwarya Rai", "23BQ1A0512", "Computer Science and Engineering", "C", 4, 7, 9.80, 0, "+91 91234 56789", "Distributed Systems, Rust, Go, Kubernetes, Cloud"},
            {"Rupesh Naidu", "23BQ1A0404", "Electronics and Communication Engineering", "A", 4, 7, 8.70, 0, "+91 92345 67890", "Robotics, Arduino, Raspberry Pi, Python, C"},
            {"Swathi Priya", "23BQ1A5405", "Artificial Intelligence and Data Science", "B", 3, 6, 9.00, 0, "+91 92345 67891", "Big Data, Spark, Hadoop, SQL, Python"},
            {"Abhinav Varma", "23BQ1A0513", "Computer Science and Engineering", "B", 4, 7, 8.90, 0, "+91 92345 67892", "Spring Boot, GraphQL, Microservices, Docker"},
            {"Gayatri Devi", "23BQ1A1209", "Information Technology", "A", 3, 6, 9.10, 0, "+91 92345 67893", "DevOps, Jenkins, GitHub Actions, AWS, Linux"},
            {"Srinivas Rao", "23BQ1A0101", "Civil Engineering", "A", 4, 7, 7.90, 0, "+91 92345 67894", "AutoCAD, Revit, Structural Analysis, Python Basics"},
            {"Harika Rani", "23BQ1A0514", "Computer Science and Engineering", "A", 4, 7, 9.55, 0, "+91 92345 67895", "Full Stack Java, React, MongoDB, Spring Security"},
            {"Charan Teja", "23BQ1A0202", "Electrical and Electronics Engineering", "B", 3, 6, 8.05, 0, "+91 92345 67896", "Control Systems, Embedded C, Circuit Design"},
            {"Mounika Lakshmi", "23BQ1A1210", "Information Technology", "B", 4, 7, 8.75, 0, "+91 92345 67897", "PHP, Laravel, Vue.js, MySQL, REST APIs"},
            {"Jagadeesh Varma", "23BQ1A0515", "Computer Science and Engineering", "C", 3, 6, 8.35, 1, "+91 92345 67898", "C++, Competitive Programming, Graph Algorithms"},
            {"Navya Sri", "23BQ1A5406", "Artificial Intelligence and Data Science", "A", 4, 7, 9.20, 0, "+91 92345 67899", "Reinforcement Learning, TensorFlow, Python, ML Ops"},
            {"Rakesh Roshan", "23BQ1A0405", "Electronics and Communication Engineering", "B", 4, 7, 8.55, 0, "+91 93456 78901", "Telecom Protocols, 5G Wireless, MATLAB, Python"},
            {"Sindhuja Reddy", "23BQ1A0516", "Computer Science and Engineering", "B", 4, 7, 9.40, 0, "+91 93456 78902", "AWS Solutions, Serverless, Lambda, Node.js, DynamoDB"},
            {"Dinesh Kumar", "23BQ1A1211", "Information Technology", "A", 3, 6, 8.45, 0, "+91 93456 78903", "Linux Kernel, Bash Scripting, Python, Networking"},
            {"Sushmitha Rao", "23BQ1A5407", "Artificial Intelligence and Data Science", "B", 4, 7, 8.85, 0, "+91 93456 78904", "Data Analytics, Tableau, Snowflake, SQL, Python"},
            {"Vamsi Krishna", "23BQ1A0517", "Computer Science and Engineering", "A", 3, 6, 9.15, 0, "+91 93456 78905", "Java 21, Virtual Threads, Spring Boot 3, Kafka"},
            {"Tanvi Priya", "23BQ1A0406", "Electronics and Communication Engineering", "A", 4, 7, 8.95, 0, "+91 93456 78906", "Semiconductor Physics, Cadence, VLSI, Python"},
            {"Surya Narayana", "23BQ1A0203", "Electrical and Electronics Engineering", "A", 4, 7, 8.25, 0, "+91 93456 78907", "Renewable Energy, Microgrids, Embedded C, PLC"},
            {"Chaitanya Varma", "23BQ1A0518", "Computer Science and Engineering", "C", 4, 7, 8.65, 0, "+91 93456 78908", "Game Dev, Unity, C#, 3D Math, Unreal Engine"},
            {"Pavani Lakshmi", "23BQ1A1212", "Information Technology", "B", 4, 7, 9.30, 0, "+91 93456 78909", "React, Redux Toolkit, Next.js, Tailwind, GraphQL"},
            {"Rajesh Khanna", "23BQ1A0302", "Mechanical Engineering", "B", 4, 7, 7.85, 1, "+91 94567 89012", "Mechatronics, Industrial Automation, Python, C"},
            {"Deepak Reddy", "23BQ1A5408", "Artificial Intelligence and Data Science", "A", 3, 6, 9.50, 0, "+91 94567 89013", "AI Agentic Systems, RAG, Pinecone, FastAPI, Python"}
        };

        for (Object[] r : rawStudents) {
            String name = (String) r[0];
            String roll = (String) r[1];
            String dept = (String) r[2];
            String section = (String) r[3];
            int year = (int) r[4];
            int sem = (int) r[5];
            double cgpa = (double) r[6];
            int backlogs = (int) r[7];
            String phone = (String) r[8];
            String skillsStr = (String) r[9];
            String email = roll.toLowerCase() + "@vvit.net";
            List<String> skills = Arrays.asList(skillsStr.split(", "));

            // Upsert User
            Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email)
                    .or(() -> userRepository.findByUsernameIgnoreCase(roll));

            User userToSave;
            if (existingUser.isEmpty()) {
                userToSave = new User(name, email, roll, passwordEncoder.encode("Student@1234"), Role.STUDENT);
                userToSave.setCreatedAt(Instant.now());
                userToSave.setUpdatedAt(Instant.now());
            } else {
                userToSave = existingUser.get();
                userToSave.setName(name);
                userToSave.setEmail(email);
                userToSave.setUpdatedAt(Instant.now());
            }
            final User savedUser = userRepository.save(userToSave);

            // Upsert StudentProfile ONLY if not already existing
            Optional<StudentProfile> existingProfile = studentProfileRepository.findByUserId(savedUser.getId())
                    .or(() -> studentProfileRepository.findByRollNumber(roll));

            if (existingProfile.isEmpty()) {
                StudentProfile profile = new StudentProfile(savedUser.getId(), name, email);
                profile.setName(name);
                profile.setEmail(email);
                profile.setRollNumber(roll);
                profile.setDepartment(dept);
                profile.setSection(section);
                profile.setYear(year);
                profile.setSemester(sem);
                profile.setCgpa(cgpa);
                profile.setBacklogs(backlogs);
                profile.setPhone(phone);
                profile.setSkills(new ArrayList<>(skills));
                profile.setCertifications(new ArrayList<>());
                profile.setProjects(new ArrayList<>());
                profile.setResumeUrl("/uploads/resumes/" + roll + "_Resume.pdf");
                profile.setLinkedinUrl("https://linkedin.com/in/" + roll.toLowerCase());
                profile.setGithubUrl("https://github.com/" + roll.toLowerCase());

                int completion = (int) Math.min(100, Math.round(75 + (cgpa * 2.5)));
                profile.setProfileCompletionPercentage(completion);
                profile.setCreatedAt(Instant.now());
                profile.setUpdatedAt(Instant.now());

                studentProfileRepository.save(profile);
            }
        }
        logger.info("Successfully verified and seeded candidate directory student records across departments.");
    }

    private void seedDriveCircularNotifications(String userId) {
        if (notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).isEmpty()) {
            // 1. SHNOOR Assessment Notice
            Notification n1 = new Notification(
                    userId,
                    "📢 SHNOOR Assessment Drive – Important Notice & Guidelines",
                    "Assessment Drive scheduled for tomorrow, 08 August 2026. Registration deadline today 4:00 PM.",
                    "CIRCULAR",
                    "/student/drives",
                    "",
                    "/uploads/circulars/SHNOOR_Assessment_Drive_Notice.pdf",
                    "SHNOOR_Assessment_Instructions.pdf",
                    "*SHNOOR Assessment Drive – Important Notice*\n\n" +
                    "This is *applicable only to students listed in the document enclosed.*\n\n" +
                    "*Event 1: Registration – Today*\n" +
                    "*Deadline: Today, 4:00 PM sharp*\n" +
                    "*Registration Link:* https://assessments.shnoor.com\n\n" +
                    "- Register before the deadline.\n" +
                    "- Select the correct college name from the dropdown.\n" +
                    "- Refer to the attached instructions before registering.\n" +
                    "- Remember the login credentials.\n\n" +
                    "*Event 2: Online Assessment Drive – Tomorrow, 08 August 2026 at Hyderabad*\n" +
                    "*Format: Online assessment through the SHNOOR Assessment Portal*\n" +
                    "*First Slot: 10:00 AM onwards*\n" +
                    "- Your assigned slot time will be displayed/shared on the portal after registration closes.\n" +
                    "- Join the assessment within 10 minutes of your assigned start time.\n" +
                    "- Use a stable internet connection and a quiet location.\n" +
                    "- Do not switch tabs or use browser back button.",
                    "📢 *SHNOOR Assessment Drive – Important Notice*\n\n" +
                    "📅 *Registration Deadline:* Today, 4:00 PM sharp\n" +
                    "🔗 *Registration Link:* https://assessments.shnoor.com\n\n" +
                    "💻 *Online Assessment:* Tomorrow, 08 Aug 2026 (10:00 AM onwards)\n" +
                    "📍 *Location:* Hyderabad\n\n" +
                    "📄 *Attached Circular Document:* Check Placify Portal for test instructions & guidelines."
            );
            n1.setCreatedAt(Instant.now().minusSeconds(1800)); // 30 mins ago

            // 2. Amazon Web Services (AWS) Notice
            Notification n2 = new Notification(
                    userId,
                    "🏢 Amazon Web Services (AWS) — Campus Hiring Circular & Syllabus",
                    "AWS has opened recruitment for Cloud Support Associate & SDE roles (44.0 LPA). Register before deadline.",
                    "CIRCULAR",
                    "/student/drives",
                    "",
                    "/uploads/circulars/AWS_Campus_Hiring_Guidelines.pdf",
                    "AWS_Campus_Hiring_Syllabus.pdf",
                    "*Amazon Web Services (AWS) Campus Recruitment 2026-27*\n\n" +
                    "*Role:* Cloud Support Associate & SDE (CTC: 44.0 LPA)\n" +
                    "*Eligibility:* B.Tech (CSE, IT, AI&DS, ECE) with CGPA >= 7.50, 0 active backlogs.\n" +
                    "*Online Test Date:* 25 September 2026.\n" +
                    "*Rounds:* Online Assessment (Coding + Aptitude) -> Technical Interview 1 -> Bar Raiser Round.\n\n" +
                    "Refer to the attached syllabus document for round pattern and sample questions.",
                    "🏢 *Amazon Web Services (AWS) Campus Drive*\n\n" +
                    "💼 *Role:* Cloud Support Associate & SDE\n" +
                    "💰 *Package:* 44.0 LPA\n" +
                    "🎯 *Eligibility:* CGPA >= 7.50, 0 Backlogs\n\n" +
                    "📄 *Circular attached on Placify:* https://placify.edu/student/drives"
            );
            n2.setCreatedAt(Instant.now().minusSeconds(7200)); // 2 hours ago

            // 3. TCS Prime Drive Notice
            Notification n3 = new Notification(
                    userId,
                    "📄 TCS Prime & Digital Drive — Registration Deadline Notice",
                    "TCS National Qualifier Test (NQT) slot booking closes on 15 September 2026. Attached hall ticket instructions.",
                    "CIRCULAR",
                    "/student/drives",
                    "",
                    "/uploads/circulars/TCS_Prime_Registration_Circular.pdf",
                    "TCS_Prime_Registration_Guide.pdf",
                    "*TCS Prime & Digital Campus Recruitment Drive*\n\n" +
                    "*Package:* 9.0 LPA (Prime) / 7.0 LPA (Digital)\n" +
                    "*Last Date to Apply:* 15 September 2026\n" +
                    "*Test Date:* 28 September 2026\n\n" +
                    "All eligible candidates are requested to complete slot booking on TCS NextStep portal as outlined in the attached guide.",
                    "📄 *TCS Prime & Digital Drive Notice*\n\n" +
                    "📅 *Deadline:* 15 September 2026\n" +
                    "💰 *Package:* 9.0 LPA\n" +
                    "📄 *Guidelines document attached in Placify Portal.*"
            );
            n3.setCreatedAt(Instant.now().minusSeconds(86400)); // 1 day ago

            // 4. Microsoft Notice
            Notification n4 = new Notification(
                    userId,
                    "⚡ Microsoft Campus Hiring 2027 — Online Coding Round Notice",
                    "Online assessment on Codility scheduled for next week. Review attached syllabus and round patterns.",
                    "CIRCULAR",
                    "/student/drives",
                    "",
                    "/uploads/circulars/Microsoft_Drive_Instructions.pdf",
                    "Microsoft_Online_Round_Pattern.pdf",
                    "*Microsoft India Campus Hiring Notice*\n\n" +
                    "*Role:* Software Engineer - Azure Core Services (CTC: 28.0 LPA)\n" +
                    "*Platform:* Codility\n" +
                    "*Topics:* DSA (Trees, Graphs, Dynamic Programming), System Design basics.",
                    "⚡ *Microsoft India Campus Hiring Notice*\n\n" +
                    "💼 *Role:* Software Engineer (28.0 LPA)\n" +
                    "📄 *Pattern & guidelines document uploaded to Placify.*"
            );
            n4.setCreatedAt(Instant.now().minusSeconds(172800)); // 2 days ago

            notificationRepository.saveAll(List.of(n1, n2, n3, n4));
            logger.info("Seeded drive circular notifications with document attachments for user: {}", userId);
        }
    }
}

