package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.DriveAnalyticsDto;
import com.placify.api.dto.DriveExportType;
import com.placify.api.dto.DriveStudentDto;
import com.placify.api.model.ApplicationStatus;
import com.placify.api.model.CompanyDrive;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.service.DriveManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/drives")
@PreAuthorize("hasRole('ADMIN')")
public class DriveManagementController {

    @Autowired
    private DriveManagementService driveManagementService;

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @GetMapping("/{driveId}/students")
    public ResponseEntity<ApiResponse<List<DriveStudentDto>>> getDriveStudents(
            @PathVariable String driveId,
            @RequestParam(required = false) Boolean eligible,
            @RequestParam(required = false) Boolean applied,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) String search) {

        List<DriveStudentDto> students = driveManagementService.getDriveStudents(driveId, eligible, applied, status, branch, search);
        return ResponseEntity.ok(ApiResponse.ok("Drive candidate list retrieved successfully", students));
    }

    @GetMapping("/{driveId}/analytics")
    public ResponseEntity<ApiResponse<DriveAnalyticsDto>> getDriveAnalytics(@PathVariable String driveId) {
        DriveAnalyticsDto analytics = driveManagementService.getDriveAnalytics(driveId);
        return ResponseEntity.ok(ApiResponse.ok("Drive analytics retrieved successfully", analytics));
    }

    @GetMapping("/{driveId}/export")
    public ResponseEntity<byte[]> exportDriveStudentsExcel(
            @PathVariable String driveId,
            @RequestParam(required = false, defaultValue = "COMPLETE_REPORT") DriveExportType exportType) throws IOException {

        byte[] excelBytes = driveManagementService.exportDriveStudentsExcel(driveId, exportType);

        CompanyDrive drive = companyDriveRepository.findById(driveId).orElse(null);
        String companyName = (drive != null && drive.getCompanyName() != null)
                ? drive.getCompanyName().replaceAll("[^a-zA-Z0-9_\\-]", "_")
                : "Placement";
        String role = (drive != null && drive.getRole() != null)
                ? drive.getRole().replaceAll("[^a-zA-Z0-9_\\-]", "_")
                : "Drive";

        String typeSuffix = switch (exportType != null ? exportType : DriveExportType.COMPLETE_REPORT) {
            case ALL_ELIGIBLE -> "Eligible_Students";
            case APPLIED -> "Applied_Candidates";
            case ELIGIBLE_NOT_APPLIED -> "Eligible_Not_Applied";
            case SELECTED -> "Selected_Candidates";
            case REJECTED -> "Rejected_Candidates";
            case COMPLETE_REPORT -> "Drive_Report";
        };

        String filename = String.format("%s_%s_%s.xlsx", companyName, role, typeSuffix);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
