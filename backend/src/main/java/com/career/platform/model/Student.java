package com.career.platform.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Student entity — represents a student user in the platform.
 * Stores profile info, resume text, extracted skills, and computed scores.
 */
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    /** Skills extracted from resume analysis */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    /** Overall career readiness score (0-100) */
    private Double readinessScore = 0.0;

    /** Interview confidence score (0-100) */
    private Double confidenceScore = 0.0;

    private String targetRole;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String profileImageUrl;

    // ===== Constructors =====
    public Student() {}

    public Student(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // ===== Getters & Setters =====
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Double getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Double readinessScore) { this.readinessScore = readinessScore; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}
