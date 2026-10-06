package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.StudentProfileDto;
import com.placify.api.model.StudentProfile;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentProfileController {

    @Autowired
    private StudentProfileService studentProfileService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfile>> getMyProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentProfile profile = studentProfileService.getProfileByUserId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfile>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody StudentProfileDto dto) {
        StudentProfile updated = studentProfileService.updateProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
