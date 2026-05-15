package com.career.platform.controller;

import com.career.platform.dto.DashboardStats;
import com.career.platform.repository.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Dashboard controller — provides aggregated stats for the Recruiter Dashboard.
 * Counts real students (who signed up) instead of hardcoded candidates.
 */
@RestController
public class DashboardController {
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;

    public DashboardController(StudentRepository studentRepository,
                               JobRepository jobRepository) {
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping("/dashboard/stats")
    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();

        long totalStudents = studentRepository.count();
        stats.setTotalCandidates(totalStudents);
        stats.setAvgReadinessScore(studentRepository.findAverageReadinessScore());
        stats.setActiveJobPosts(jobRepository.count());

        // Students with readiness >= 80 are considered "shortlisted-ready"
        long shortlisted = studentRepository.findAll().stream()
                .filter(s -> s.getReadinessScore() != null && s.getReadinessScore() >= 80)
                .count();
        stats.setShortlistedCount(shortlisted);
        stats.setNewApplicationsToday(0L);

        // Status breakdown based on student readiness tiers
        long highReady = studentRepository.findAll().stream()
                .filter(s -> s.getReadinessScore() != null && s.getReadinessScore() >= 80).count();
        long midReady = studentRepository.findAll().stream()
                .filter(s -> s.getReadinessScore() != null && s.getReadinessScore() >= 50 && s.getReadinessScore() < 80).count();
        long lowReady = studentRepository.findAll().stream()
                .filter(s -> s.getReadinessScore() == null || s.getReadinessScore() < 50).count();

        stats.setStatusBreakdown(Map.of(
                "interview", highReady,
                "shortlisted", highReady,
                "reviewing", midReady,
                "new", lowReady,
                "rejected", 0L
        ));

        return stats;
    }
}
