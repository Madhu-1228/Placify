package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.GenerateRoadmapRequest;
import com.placify.api.dto.UpdateTaskStatusRequest;
import com.placify.api.model.PreparationRoadmap;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.RoadmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    @GetMapping("/current")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PreparationRoadmap>> getCurrentRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PreparationRoadmap roadmap = roadmapService.getCurrentRoadmap(userPrincipal.getId()).orElse(null);
        if (roadmap == null) {
            return ResponseEntity.ok(ApiResponse.ok("No active preparation roadmap found", null));
        }
        return ResponseEntity.ok(ApiResponse.ok("Preparation roadmap retrieved successfully", roadmap));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PreparationRoadmap>> generateRoadmap(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody GenerateRoadmapRequest request) {
        PreparationRoadmap roadmap = roadmapService.generateRoadmap(
                userPrincipal.getId(),
                request.getTargetRole(),
                request.getTargetDriveId(),
                request.getDurationDays(),
                request.isRegenerate()
        );
        return ResponseEntity.ok(ApiResponse.ok("Personalized preparation roadmap generated successfully", roadmap));
    }

    @PutMapping("/{roadmapId}/tasks/{taskId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PreparationRoadmap>> updateTaskStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String roadmapId,
            @PathVariable String taskId,
            @RequestBody UpdateTaskStatusRequest request) {
        PreparationRoadmap updated = roadmapService.updateTaskStatus(
                userPrincipal.getId(),
                roadmapId,
                taskId,
                request.getStatus()
        );
        return ResponseEntity.ok(ApiResponse.ok("Task status updated successfully", updated));
    }

    @GetMapping("/target-roles")
    public ResponseEntity<ApiResponse<List<String>>> getTargetRoles() {
        List<String> roles = roadmapService.getPopularTargetRoles();
        return ResponseEntity.ok(ApiResponse.ok("Target roles retrieved successfully", roles));
    }
}
