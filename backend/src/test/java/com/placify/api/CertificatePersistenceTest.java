package com.placify.api;

import com.placify.api.dto.StudentProfileDto;
import com.placify.api.model.Certification;
import com.placify.api.model.StudentProfile;
import com.placify.api.model.User;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.repository.NotificationRepository;
import com.placify.api.repository.QuizRepository;
import com.placify.api.repository.ResourceRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import com.placify.api.service.DataInitializerService;
import com.placify.api.service.StudentProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class CertificatePersistenceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private CompanyDriveRepository companyDriveRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataInitializerService dataInitializerService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(dataInitializerService, "defaultAdminEmail", "vvitu@cds.edu");
        ReflectionTestUtils.setField(dataInitializerService, "defaultAdminPassword", "Admin@123456");
        ReflectionTestUtils.setField(dataInitializerService, "defaultAdminName", "VVITU CDS");
    }

    @Test
    public void testCertificationModelMetadataAndFileReference() {
        Certification cert = new Certification();
        cert.setCertificateTitle("AWS Certified Cloud Practitioner");
        cert.setIssuer("Amazon Web Services");
        cert.setYear("2025");
        cert.setFileName("AWS_Cert_Sample.pdf");
        cert.setFileType("PDF");
        cert.setFileUrl("/uploads/certificates/23BQ1A1228_Cert_123456.pdf");
        cert.setFileSize(504261L);
        cert.setVerificationStatus("VERIFIED");

        assertEquals("AWS Certified Cloud Practitioner", cert.getCertificateTitle());
        assertEquals("AWS Certified Cloud Practitioner", cert.getName());
        assertEquals("Amazon Web Services", cert.getIssuer());
        assertEquals("2025", cert.getIssueDate());
        assertEquals("2025", cert.getYear());
        assertEquals("AWS_Cert_Sample.pdf", cert.getFileName());
        assertEquals("PDF", cert.getFileType());
        assertEquals("/uploads/certificates/23BQ1A1228_Cert_123456.pdf", cert.getFileUrl());
        assertEquals(504261L, cert.getFileSize());
        assertEquals("VERIFIED", cert.getVerificationStatus());
        assertNotNull(cert.getId());
    }

    @Test
    public void testDataInitializerPreservesUploadedCertificatesOnRestart() {
        // Mock existing student user
        User mockUser = new User("Devanaboyina Madhu", "23BQ1A1228@vvit.net", "MadhuD", "encodedPass", null);
        mockUser.setId("student-user-123");
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Mock existing student profile that already has an uploaded certificate
        StudentProfile existingProfile = new StudentProfile("student-user-123", "Devanaboyina Madhu", "23BQ1A1228@vvit.net");
        existingProfile.setRollNumber("23BQ1A1228");
        existingProfile.setDepartment("Information Technology");

        Certification uploadedCert = new Certification();
        uploadedCert.setId("cert-custom-1");
        uploadedCert.setCertificateTitle("AWS Certified Solutions Architect");
        uploadedCert.setIssuer("Amazon Web Services");
        uploadedCert.setIssueDate("2025");
        uploadedCert.setFileName("my_aws_cert.pdf");
        uploadedCert.setFileType("PDF");
        uploadedCert.setFileUrl("/uploads/certificates/23BQ1A1228_Cert_999999.pdf");

        List<Certification> certs = new ArrayList<>();
        certs.add(uploadedCert);
        existingProfile.setCertifications(certs);

        when(studentProfileRepository.findByUserId("student-user-123")).thenReturn(Optional.of(existingProfile));
        when(resourceRepository.count()).thenReturn(10L);
        when(quizRepository.count()).thenReturn(10L);
        when(companyDriveRepository.count()).thenReturn(10L);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(anyString())).thenReturn(List.of());

        // Simulate backend restart by executing data initialization
        dataInitializerService.initializeDevelopmentData();

        // Verify that the existing profile's certifications were PRESERVED and NOT replaced with hardcoded defaults
        assertEquals(1, existingProfile.getCertifications().size(), "Existing student certificates must be preserved on restart");
        Certification savedCert = existingProfile.getCertifications().get(0);
        assertEquals("cert-custom-1", savedCert.getId());
        assertEquals("AWS Certified Solutions Architect", savedCert.getCertificateTitle());
        assertEquals("/uploads/certificates/23BQ1A1228_Cert_999999.pdf", savedCert.getFileUrl());
    }

    @Test
    public void testStudentProfileServiceUpdatesCertifications() {
        StudentProfileService profileService = new StudentProfileService();
        ReflectionTestUtils.setField(profileService, "studentProfileRepository", studentProfileRepository);
        ReflectionTestUtils.setField(profileService, "userRepository", userRepository);

        User mockUser = new User("Devanaboyina Madhu", "23BQ1A1228@vvit.net", "MadhuD", "encodedPass", null);
        mockUser.setId("u-123");
        when(userRepository.findById("u-123")).thenReturn(Optional.of(mockUser));

        StudentProfile currentProfile = new StudentProfile("u-123", "Devanaboyina Madhu", "23BQ1A1228@vvit.net");
        when(studentProfileRepository.findByUserId("u-123")).thenReturn(Optional.of(currentProfile));
        when(studentProfileRepository.save(any(StudentProfile.class))).thenAnswer(i -> i.getArgument(0));

        // Create DTO with updated certifications list
        StudentProfileDto dto = new StudentProfileDto();
        dto.setName("Devanaboyina Madhu");
        dto.setEmail("23BQ1A1228@vvit.net");
        dto.setRollNumber("23BQ1A1228");

        Certification cert1 = new Certification("Oracle Java SE", "Oracle", "2024", "http://oracle.com");
        cert1.setFileUrl("/uploads/certificates/cert1.pdf");
        dto.setCertifications(List.of(cert1));

        StudentProfile updated = profileService.updateProfile("u-123", dto);

        assertNotNull(updated.getCertifications());
        assertEquals(1, updated.getCertifications().size());
        assertEquals("Oracle Java SE", updated.getCertifications().get(0).getCertificateTitle());
        assertEquals("/uploads/certificates/cert1.pdf", updated.getCertifications().get(0).getFileUrl());
    }
}
