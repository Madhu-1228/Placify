package com.placify.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("app", "Placify API");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        boolean mongoConnected = false;
        try {
            if (mongoTemplate != null) {
                mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
                mongoConnected = true;
            }
        } catch (Exception e) {
            mongoConnected = false;
            response.put("mongoError", e.getMessage());
        }

        response.put("database", mongoConnected ? "CONNECTED" : "DISCONNECTED");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("platform", "Placify - Intelligent Placement Preparation & Tracking Platform");
        response.put("phase", "Phase 1 - Project Scaffolding & Setup");
        response.put("apiStatus", "ONLINE");
        response.put("supportedRoles", new String[]{"STUDENT", "ADMIN"});
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
