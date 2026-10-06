package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.model.Certification;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.CertificateManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/student/certifications")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class CertificateController {

    @Autowired
    private CertificateManagementService certificateManagementService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Certification>> uploadAndVerifyCertificate(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "certificateTitle", required = false) String certificateTitle,
            @RequestParam(value = "issuer", required = false) String issuer,
            @RequestParam(value = "issueDate", required = false) String issueDate,
            @RequestParam(value = "credentialUrl", required = false) String credentialUrl,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        String title = (certificateTitle != null && !certificateTitle.isBlank()) ? certificateTitle : name;
        Certification cert = certificateManagementService.uploadAndVerifyCertificate(
                userPrincipal.getId(),
                file,
                title,
                issuer,
                issueDate,
                credentialUrl
        );
        return ResponseEntity.ok(ApiResponse.ok("Certificate uploaded and verified successfully!", cert));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Certification>>> getMyCertifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<Certification> certs = certificateManagementService.getStudentCertifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Certifications retrieved successfully", certs));
    }

    @DeleteMapping("/{certId}")
    public ResponseEntity<ApiResponse<Void>> deleteCertification(
            @PathVariable String certId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        certificateManagementService.deleteCertification(userPrincipal.getId(), certId);
        return ResponseEntity.ok(ApiResponse.ok("Certification record deleted successfully", null));
    }
}
