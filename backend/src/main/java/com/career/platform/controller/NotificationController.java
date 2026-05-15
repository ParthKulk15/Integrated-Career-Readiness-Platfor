package com.career.platform.controller;

import com.career.platform.model.Notification;
import com.career.platform.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Notification controller — handles shortlisting candidates and student notifications.
 */
@RestController
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** Shortlist a candidate — creates a notification for the student */
    @PostMapping("/notifications/shortlist")
    @ResponseStatus(HttpStatus.CREATED)
    public Notification shortlistCandidate(@RequestBody Map<String, Object> body) {
        Long studentId = ((Number) body.get("studentId")).longValue();
        Long recruiterId = body.get("recruiterId") != null ? ((Number) body.get("recruiterId")).longValue() : null;
        String message = (String) body.getOrDefault("message",
                "You have been shortlisted by a recruiter! Prepare for the next steps.");

        Notification notification = new Notification(studentId, recruiterId, message, "SHORTLISTED");
        return notificationRepository.save(notification);
    }

    /** Get all notifications for a student */
    @GetMapping("/notifications/student/{studentId}")
    public List<Notification> getStudentNotifications(@PathVariable Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    /** Get all notifications for a recruiter */
    @GetMapping("/notifications/recruiter/{recruiterId}")
    public List<Notification> getRecruiterNotifications(@PathVariable Long recruiterId) {
        return notificationRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
    }

    /** Mark a notification as read */
    @PutMapping("/notifications/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
