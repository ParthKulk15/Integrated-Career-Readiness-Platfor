package com.career.platform.dto;

import com.career.platform.model.Application;
import com.career.platform.model.Student;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicationResponse {
    private Long id;
    private Long studentId;
    private Long jobId;
    private String name;
    private String role;
    private String time;
    private Integer score;
    private String status;
    private List<String> skills;
    private LocalDateTime interviewDate;
    private String interviewLink;

    public static ApplicationResponse from(Application application, Student student) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getApplicationId());
        response.setStudentId(student.getStudentId());
        response.setJobId(application.getJobId());
        response.setName(student.getName());
        response.setRole(student.getTargetRole() != null ? student.getTargetRole() : "Student");
        response.setTime(relativeTime(application.getAppliedTime()));
        response.setScore(application.getMatchScore() == null ? 0 : (int) Math.round(application.getMatchScore()));
        response.setStatus(application.getStatus().name().toLowerCase());
        response.setSkills(student.getSkills());
        response.setInterviewDate(application.getInterviewDate());
        response.setInterviewLink(application.getInterviewLink());
        return response;
    }

    private static String relativeTime(LocalDateTime appliedTime) {
        if (appliedTime == null) return "just now";
        Duration duration = Duration.between(appliedTime, LocalDateTime.now());
        long minutes = Math.max(0, duration.toMinutes());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " min ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        long days = hours / 24;
        return days + (days == 1 ? " day ago" : " days ago");
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

    public String getInterviewLink() { return interviewLink; }
    public void setInterviewLink(String interviewLink) { this.interviewLink = interviewLink; }
}
