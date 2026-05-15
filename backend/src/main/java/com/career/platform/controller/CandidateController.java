package com.career.platform.controller;

import com.career.platform.model.Notification;
import com.career.platform.model.Student;
import com.career.platform.repository.NotificationRepository;
import com.career.platform.repository.StudentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Returns registered students as "candidates" for the recruiter pipeline.
 * Status is NOT auto-derived from readiness score.
 * All candidates start as "new" — only a recruiter's manual Shortlist action changes status.
 */
@RestController
public class CandidateController {
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;

    public CandidateController(StudentRepository studentRepository,
                               NotificationRepository notificationRepository) {
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/candidates")
    public List<Map<String, Object>> getCandidates() {
        // Get all student IDs that have been shortlisted (have a SHORTLISTED notification)
        List<Notification> allNotifications = notificationRepository.findAll();
        Set<Long> shortlistedStudentIds = allNotifications.stream()
                .filter(n -> "SHORTLISTED".equals(n.getType()))
                .map(Notification::getStudentId)
                .collect(Collectors.toSet());

        return studentRepository.findAll().stream().map(s -> {
            // Status is manual: "shortlisted" only if recruiter clicked Shortlist, otherwise "new"
            String status = shortlistedStudentIds.contains(s.getStudentId()) ? "shortlisted" : "new";
            Double r = s.getReadinessScore();

            Map<String, Object> map = new HashMap<>();
            map.put("candidateId", s.getStudentId());
            map.put("name", s.getName() != null ? s.getName() : "Unknown");
            map.put("email", s.getEmail());
            map.put("role", s.getTargetRole() != null ? s.getTargetRole() : "Student");
            map.put("location", s.getLocation() != null ? s.getLocation() : "Not specified");
            map.put("readiness", r != null ? r.intValue() : 0);
            map.put("status", status);
            map.put("skills", s.getSkills() != null ? s.getSkills() : List.of());
            map.put("avatarUrl", "https://ui-avatars.com/api/?background=00346f&color=fff&name=" +
                    (s.getName() != null ? s.getName().replace(" ", "+") : "U"));
            return map;
        }).collect(Collectors.toList());
    }
}
