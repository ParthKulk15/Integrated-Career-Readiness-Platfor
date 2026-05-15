package com.career.platform.service;

import com.career.platform.model.InterviewResult;
import com.career.platform.model.Student;
import com.career.platform.repository.InterviewResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

/**
 * Mock interview service — simulates interview sessions and stores results.
 */
@Service
public class InterviewService {
    private static final String[] CATEGORIES = {"Technical", "Behavioral", "System Design"};

    private static final String[] TECHNICAL_FEEDBACK = {
            "Strong grasp of data structures. Consider deepening knowledge of algorithms.",
            "Good problem-solving approach, but needs more practice with time complexity analysis.",
            "Excellent coding skills. Work on explaining your thought process more clearly.",
            "Solid fundamentals. Try tackling harder dynamic programming problems."
    };

    private static final String[] BEHAVIORAL_FEEDBACK = {
            "Clear communication style. Use the STAR method more consistently.",
            "Great examples of teamwork. Prepare more stories about conflict resolution.",
            "Shows strong leadership potential. Practice being more concise in responses.",
            "Good self-awareness. Focus on quantifying achievements in your examples."
    };

    private static final String[] SYSTEM_DESIGN_FEEDBACK = {
            "Good high-level architecture. Dive deeper into scalability trade-offs.",
            "Strong understanding of distributed systems. Consider discussing caching strategies more.",
            "Creative solutions. Practice estimating capacity and throughput requirements.",
            "Solid fundamentals. Work on discussing database sharding and replication patterns."
    };

    private final InterviewResultRepository interviewResultRepository;
    private final StudentService studentService;
    private final Random random = new Random();

    public InterviewService(InterviewResultRepository interviewResultRepository, StudentService studentService) {
        this.interviewResultRepository = interviewResultRepository;
        this.studentService = studentService;
    }

    /**
     * Simulate a mock interview for the given student.
     * Score is influenced by the student's readiness + random variance.
     */
    public InterviewResult simulateInterview(Long studentId, String category) {
        Student student = studentService.getStudentById(studentId);

        // Determine category
        String interviewCategory = (category != null && !category.isBlank())
                ? category
                : CATEGORIES[random.nextInt(CATEGORIES.length)];

        // Base score from readiness (40-70 range) + random variance (-15 to +25)
        double baseScore = student.getReadinessScore() != null ? student.getReadinessScore() : 50.0;
        int score = (int) Math.round(baseScore * 0.6 + random.nextInt(35) + 15);
        score = Math.max(20, Math.min(100, score));

        // Generate feedback based on category
        String feedback = generateFeedback(interviewCategory);

        InterviewResult result = new InterviewResult(studentId, score, feedback, interviewCategory);
        interviewResultRepository.save(result);

        // Update student confidence score (running average of last 5 interviews)
        updateConfidenceScore(studentId);

        return result;
    }

    /**
     * Get interview history for a student.
     */
    public List<InterviewResult> getHistory(Long studentId) {
        return interviewResultRepository.findByStudentIdOrderByTimestampDesc(studentId);
    }

    private String generateFeedback(String category) {
        return switch (category) {
            case "Technical" -> TECHNICAL_FEEDBACK[random.nextInt(TECHNICAL_FEEDBACK.length)];
            case "Behavioral" -> BEHAVIORAL_FEEDBACK[random.nextInt(BEHAVIORAL_FEEDBACK.length)];
            case "System Design" -> SYSTEM_DESIGN_FEEDBACK[random.nextInt(SYSTEM_DESIGN_FEEDBACK.length)];
            default -> "Good performance overall. Keep practicing!";
        };
    }

    private void updateConfidenceScore(Long studentId) {
        List<InterviewResult> recent = interviewResultRepository.findByStudentIdOrderByTimestampDesc(studentId);
        List<InterviewResult> lastFive = recent.stream().limit(5).toList();
        double avgScore = lastFive.stream()
                .mapToInt(InterviewResult::getInterviewScore)
                .average()
                .orElse(0.0);
        Student student = studentService.getStudentById(studentId);
        student.setConfidenceScore(Math.round(avgScore * 10.0) / 10.0);
        // Trigger readiness recalculation
        studentService.calculateReadinessScore(studentId);
    }
}
