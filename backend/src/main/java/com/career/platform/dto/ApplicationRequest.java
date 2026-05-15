package com.career.platform.dto;

import jakarta.validation.constraints.NotNull;

public class ApplicationRequest {
    @NotNull
    private Long studentId;

    @NotNull
    private Long jobId;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
