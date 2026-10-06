package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.StudentCreateRequest;
import com.placify.api.model.StudentProfile;
import com.placify.api.service.AdminStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    @Autowired
    private AdminStudentService adminStudentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentProfile>>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Double minCgpa,
            @RequestParam(required = false) Integer maxBacklogs) {
        List<StudentProfile> students = adminStudentService.getAllStudents(search, department, year, minCgpa, maxBacklogs);
        return ResponseEntity.ok(ApiResponse.ok("Students retrieved successfully", students));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentProfile>> createStudent(
            @RequestBody StudentCreateRequest request) {
        StudentProfile created = adminStudentService.createStudent(request);
        return ResponseEntity.ok(ApiResponse.ok("Student candidate created successfully!", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDetail(@PathVariable String id) {
        Map<String, Object> detail = adminStudentService.getStudentDetail(id);
        return ResponseEntity.ok(ApiResponse.ok("Student details retrieved", detail));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleAccountStatus(
            @PathVariable String id,
            @RequestParam boolean active) {
        adminStudentService.setStudentAccountStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Student account status updated to: " + (active ? "ACTIVE" : "INACTIVE")));
    }
}
