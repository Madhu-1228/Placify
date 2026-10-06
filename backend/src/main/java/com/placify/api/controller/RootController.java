package com.placify.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping({"/", "/api"})
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("application", "PLACIFY API - Intelligent Placement Preparation & Tracking Platform");
        response.put("status", "ONLINE");
        response.put("version", "1.0.0");
        response.put("frontendUrl", "http://localhost:5173");
        response.put("documentation", "REST API endpoints available under /api/*");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
