package com.career.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * InterviewResult entity — stores mock interview simulation results.
 */
@Entity
@Table(name = "interview_results")
public class InterviewResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    /** Score out of 100 */
    private Integer interviewScore;

    /** AI-generated feedback */
    @Column(columnDefinition = "TEXT")
    private String feedback;

    /** Areas assessed */
    private String category; // e.g., "Technical", "Behavioral", "System Design"

    private LocalDateTime timestamp;

    // ===== Constructors =====
    public InterviewResult() {
        this.timestamp = LocalDateTime.now();
    }

    public InterviewResult(Long studentId, Integer interviewScore, String feedback, String category) {
        this.studentId = studentId;
        this.interviewScore = interviewScore;
        this.feedback = feedback;
        this.category = category;
        this.timestamp = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Integer getInterviewScore() { return interviewScore; }
    public void setInterviewScore(Integer interviewScore) { this.interviewScore = interviewScore; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
