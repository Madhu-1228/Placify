package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.model.ResumeAnalysis;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.ResumeAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
public class ResumeAnalyzerController {

    @Autowired
    private ResumeAnalysisService resumeAnalysisService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ResumeAnalysis>> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetSkills", required = false) List<String> targetSkills,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeAnalysis analysis = resumeAnalysisService.analyzeUploadedResume(userPrincipal.getId(), file, targetSkills);
        return ResponseEntity.ok(ApiResponse.ok("Resume analysis completed successfully", analysis));
    }

    @GetMapping("/latest")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ResumeAnalysis>> getLatestAnalysis(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeAnalysis analysis = resumeAnalysisService.getLatestAnalysis(userPrincipal.getId())
                .orElse(null);
        return ResponseEntity.ok(ApiResponse.ok("Latest analysis retrieved", analysis));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ResumeAnalysis>>> getAnalysisHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeAnalysis> history = resumeAnalysisService.getAnalysisHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Resume analysis history retrieved", history));
    }
}
