package com.career.platform.dto;

import java.util.List;

/**
 * Result DTO for job-candidate matching.
 */
public class MatchResult {
    private Long studentId;
    private String studentName;
    private String candidateName;
    private String role;
    private double matchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private Double readinessScore;
    private String img;

    public MatchResult() {}

    public MatchResult(Long studentId, String studentName, double matchPercentage,
                       List<String> matchedSkills, List<String> missingSkills, Double readinessScore) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.candidateName = studentName;
        this.matchPercentage = matchPercentage;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.readinessScore = readinessScore;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(double matchPercentage) { this.matchPercentage = matchPercentage; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public Double getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Double readinessScore) { this.readinessScore = readinessScore; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}
