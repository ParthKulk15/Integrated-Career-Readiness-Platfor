package com.career.platform.dto;

import java.util.List;

/**
 * Result DTO for resume analysis — returned by the analysis API.
 */
public class ResumeAnalysisResult {
    private List<String> extractedSkills;
    private double alignmentScore;
    private int totalSkillsDetected;
    private String level; // Junior, Mid, Senior

    public ResumeAnalysisResult() {}

    public ResumeAnalysisResult(List<String> extractedSkills, double alignmentScore) {
        this.extractedSkills = extractedSkills;
        this.alignmentScore = alignmentScore;
        this.totalSkillsDetected = extractedSkills.size();
        this.level = alignmentScore >= 80 ? "Senior" : alignmentScore >= 50 ? "Mid" : "Junior";
    }

    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }

    public double getAlignmentScore() { return alignmentScore; }
    public void setAlignmentScore(double alignmentScore) { this.alignmentScore = alignmentScore; }

    public int getTotalSkillsDetected() { return totalSkillsDetected; }
    public void setTotalSkillsDetected(int totalSkillsDetected) { this.totalSkillsDetected = totalSkillsDetected; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
