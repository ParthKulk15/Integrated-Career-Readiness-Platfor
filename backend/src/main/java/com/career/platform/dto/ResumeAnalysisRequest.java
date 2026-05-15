package com.career.platform.dto;

import java.util.List;

/**
 * Request DTO for resume analysis.
 */
public class ResumeAnalysisRequest {
    private String resumeText;
    private Long studentId; // optional — if set, updates the student record

    public ResumeAnalysisRequest() {}

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
}
