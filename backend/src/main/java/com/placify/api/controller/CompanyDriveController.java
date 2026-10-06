package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.CompanyDriveRequest;
import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.DriveStatus;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.CompanyDriveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
public class CompanyDriveController {

    @Autowired
    private CompanyDriveService companyDriveService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyDrive>>> getAllDrives(
            @RequestParam(required = false) DriveStatus status,
            @RequestParam(required = false) String search) {
        List<CompanyDrive> drives = companyDriveService.getAllDrives(status, search);
        return ResponseEntity.ok(ApiResponse.ok("Drives retrieved successfully", drives));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDrive>> getDriveById(@PathVariable String id) {
        CompanyDrive drive = companyDriveService.getDriveById(id);
        return ResponseEntity.ok(ApiResponse.ok("Drive details retrieved", drive));
    }

    @GetMapping("/eligible")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEligibleDrivesForStudent(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Map<String, Object>> drivesWithEligibility = companyDriveService.getEligibleDrivesForStudent(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Eligible drives calculated successfully", drivesWithEligibility));
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EligibilityResultDto>> checkEligibility(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EligibilityResultDto result = companyDriveService.checkEligibilityForDrive(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Eligibility evaluated", result));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDrive>> createDrive(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CompanyDriveRequest request) {
        CompanyDrive created = companyDriveService.createDrive(request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Company drive created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDrive>> updateDrive(
            @PathVariable String id,
            @Valid @RequestBody CompanyDriveRequest request) {
        CompanyDrive updated = companyDriveService.updateDrive(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Company drive updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDrive(@PathVariable String id) {
        companyDriveService.deleteDrive(id);
        return ResponseEntity.ok(ApiResponse.ok("Company drive deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDrive>> updateDriveStatus(
            @PathVariable String id,
            @RequestParam DriveStatus status) {
        CompanyDrive updated = companyDriveService.updateDriveStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Drive status updated to: " + status, updated));
    }
}
