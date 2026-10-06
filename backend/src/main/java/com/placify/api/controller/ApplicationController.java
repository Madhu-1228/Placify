package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.ApplicationSubmitRequest;
import com.placify.api.dto.StatusUpdateRequest;
import com.placify.api.model.Application;
import com.placify.api.model.ApplicationStatus;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/apply/{driveId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Application>> applyForDrive(
            @PathVariable String driveId,
            @RequestBody(required = false) ApplicationSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Application application = applicationService.applyForDrive(userPrincipal.getId(), driveId, request);
        return ResponseEntity.ok(ApiResponse.ok("Application submitted successfully!", application));
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Application>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Application> apps = applicationService.getMyApplications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Applications retrieved", apps));
    }

    @GetMapping("/drive/{driveId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Application>>> getApplicationsForDrive(@PathVariable String driveId) {
        List<Application> apps = applicationService.getApplicationsForDrive(driveId);
        return ResponseEntity.ok(ApiResponse.ok("Drive applicants retrieved", apps));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Application>>> getAllApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String driveId) {
        List<Application> apps = applicationService.getAllApplications(status, driveId);
        return ResponseEntity.ok(ApiResponse.ok("All applications retrieved", apps));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Application>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Application updated = applicationService.updateApplicationStatus(id, request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Application status updated to " + request.getStatus(), updated));
    }
}
