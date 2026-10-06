package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadBaseDir;

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file. Please select a valid document.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "resume.pdf";
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        // Clean user prefix
        String userPrefix = (userPrincipal != null && userPrincipal.getUsername() != null)
                ? userPrincipal.getUsername().replaceAll("[^a-zA-Z0-9_\\-]", "_")
                : "Candidate";

        String savedFilename = userPrefix + "_Resume_" + System.currentTimeMillis() + extension;

        try {
            Path targetFolder = Paths.get(uploadBaseDir, "resumes").toAbsolutePath().normalize();
            if (!Files.exists(targetFolder)) {
                Files.createDirectories(targetFolder);
            }

            Path targetPath = targetFolder.resolve(savedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/uploads/resumes/" + savedFilename;

            Map<String, Object> result = new HashMap<>();
            result.put("fileUrl", publicUrl);
            result.put("fileName", originalFilename);
            result.put("fileSize", formatFileSize(file.getSize()));
            result.put("uploadedAt", System.currentTimeMillis());

            return ResponseEntity.ok(ApiResponse.ok("Resume file uploaded successfully from local device", result));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file: " + e.getMessage(), e);
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
