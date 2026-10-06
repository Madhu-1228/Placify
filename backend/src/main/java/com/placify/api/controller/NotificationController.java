package com.placify.api.controller;

import com.placify.api.dto.ApiResponse;
import com.placify.api.dto.DriveBroadcastRequest;
import com.placify.api.model.Notification;
import com.placify.api.security.UserPrincipal;
import com.placify.api.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Notification> list = notificationService.getUserNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", list));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked notification as read"));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Marked all notifications as read"));
    }

    @PostMapping("/broadcast-drive-circular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> broadcastDriveCircular(
            @RequestBody DriveBroadcastRequest request) {
        int count = notificationService.broadcastDriveCircular(request);
        Map<String, Object> response = new HashMap<>();
        response.put("recipientsCount", count);
        response.put("title", request.getTitle());
        response.put("documentUrl", request.getDocumentUrl());
        return ResponseEntity.ok(ApiResponse.ok("Drive circular and WhatsApp notification broadcasted to " + count + " candidates!", response));
    }
}
