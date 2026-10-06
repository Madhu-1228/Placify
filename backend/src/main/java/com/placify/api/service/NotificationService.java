package com.placify.api.service;

import com.placify.api.dto.DriveBroadcastRequest;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.Notification;
import com.placify.api.model.Role;
import com.placify.api.model.StudentProfile;
import com.placify.api.model.User;
import com.placify.api.repository.NotificationRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String id, String userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (n.getUserId().equals(userId)) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(String userId, String title, String message, String type, String link) {
        Notification n = new Notification(userId, title, message, type, link);
        n.setCreatedAt(Instant.now());
        return notificationRepository.save(n);
    }

    public Notification createDriveCircularNotification(
            String userId,
            String title,
            String message,
            String type,
            String link,
            String driveId,
            String documentUrl,
            String documentName,
            String noticeText,
            String whatsappText) {
        Notification n = new Notification(userId, title, message, type, link, driveId, documentUrl, documentName, noticeText, whatsappText);
        n.setCreatedAt(Instant.now());
        return notificationRepository.save(n);
    }

    public int broadcastDriveCircular(DriveBroadcastRequest req) {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT && u.isActive())
                .toList();

        List<Notification> notificationsToSave = new ArrayList<>();

        for (User s : students) {
            if (StringUtils.hasText(req.getTargetDepartment()) && !req.getTargetDepartment().equalsIgnoreCase("ALL")) {
                Optional<StudentProfile> prof = studentProfileRepository.findByUserId(s.getId());
                if (prof.isPresent() && prof.get().getDepartment() != null &&
                        !prof.get().getDepartment().equalsIgnoreCase(req.getTargetDepartment())) {
                    continue;
                }
            }

            Notification n = new Notification(
                    s.getId(),
                    req.getTitle() != null ? req.getTitle() : "Placement Drive Circular",
                    req.getMessage() != null ? req.getMessage() : "New recruitment notice published.",
                    "CIRCULAR",
                    "/student/drives",
                    req.getDriveId(),
                    req.getDocumentUrl(),
                    req.getDocumentName() != null ? req.getDocumentName() : "Drive_Notice.pdf",
                    req.getNoticeText(),
                    req.getWhatsappText()
            );
            n.setCreatedAt(Instant.now());
            notificationsToSave.add(n);
        }

        notificationRepository.saveAll(notificationsToSave);
        return notificationsToSave.size();
    }
}
