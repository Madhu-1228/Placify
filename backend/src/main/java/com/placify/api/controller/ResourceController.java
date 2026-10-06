package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.ResourceRequest;
import com.placify.api.model.DifficultyLevel;
import com.placify.api.model.Resource;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getAllResources(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) DifficultyLevel difficulty,
            @RequestParam(required = false) String search) {
        List<Resource> resources = resourceService.getAllResources(category, difficulty, search);
        return ResponseEntity.ok(ApiResponse.ok("Resources retrieved successfully", resources));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> createResource(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ResourceRequest request) {
        Resource created = resourceService.createResource(request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Preparation resource added", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource deleted successfully"));
    }

    @PostMapping("/{id}/toggle-complete")
    public ResponseEntity<ApiResponse<Resource>> toggleComplete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Resource updated = resourceService.toggleResourceCompletion(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Resource progress updated", updated));
    }
}
