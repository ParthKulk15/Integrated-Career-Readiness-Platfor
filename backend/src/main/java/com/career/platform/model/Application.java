package com.career.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Application entity — tracks a student's application to a job.
 */
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long jobId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.NEW;

    private LocalDateTime appliedTime;

    /** Match score calculated at application time */
    private Double matchScore;

    private LocalDateTime interviewDate;

    private String interviewLink;

    // ===== Constructors =====
    public Application() {
        this.appliedTime = LocalDateTime.now();
    }

    public Application(Long candidateId, Long jobId) {
        this.candidateId = candidateId;
        this.jobId = jobId;
        this.status = ApplicationStatus.NEW;
        this.appliedTime = LocalDateTime.now();
    }

    // ===== Getters & Setters =====
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public LocalDateTime getAppliedTime() { return appliedTime; }
    public void setAppliedTime(LocalDateTime appliedTime) { this.appliedTime = appliedTime; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

    public String getInterviewLink() { return interviewLink; }
    public void setInterviewLink(String interviewLink) { this.interviewLink = interviewLink; }
}
