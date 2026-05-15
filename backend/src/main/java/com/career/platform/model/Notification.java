package com.career.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Notification entity — stores notifications for students (e.g. shortlist alerts).
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    private Long recruiterId;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // SHORTLISTED, INFO, etc.

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ===== Constructors =====
    public Notification() {}

    public Notification(Long studentId, Long recruiterId, String message, String type) {
        this.studentId = studentId;
        this.recruiterId = recruiterId;
        this.message = message;
        this.type = type;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
