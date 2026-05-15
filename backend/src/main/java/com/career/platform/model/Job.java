package com.career.platform.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Job entity — represents a job posting created by a recruiter.
 */
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @Column(nullable = false)
    private String jobRole;

    private String companyName;
    private String department;
    private String location;
    private Integer openings = 1;
    private Integer applicants = 0;
    private Integer displayMatchScore = 0;
    private Boolean featured = false;

    /** ID of the recruiter who posted this job */
    private Long recruiterId;

    /** Skills required for the role */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_required_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== Constructors =====
    public Job() {}

    public Job(String jobRole, String department, List<String> requiredSkills) {
        this.jobRole = jobRole;
        this.department = department;
        this.requiredSkills = requiredSkills;
    }

    // ===== Getters & Setters =====
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public Integer getApplicants() { return applicants; }
    public void setApplicants(Integer applicants) { this.applicants = applicants; }

    public Integer getDisplayMatchScore() { return displayMatchScore; }
    public void setDisplayMatchScore(Integer displayMatchScore) { this.displayMatchScore = displayMatchScore; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
