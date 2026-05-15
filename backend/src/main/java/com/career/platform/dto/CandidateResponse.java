package com.career.platform.dto;

import com.career.platform.model.Candidate;

import java.time.format.DateTimeFormatter;
import java.util.List;

public class CandidateResponse {
    private Long id;
    private String name;
    private String role;
    private Integer readiness;
    private String status;
    private List<String> skills;
    private String location;
    private String applied;
    private String img;

    public CandidateResponse() {}

    public static CandidateResponse from(Candidate candidate) {
        CandidateResponse response = new CandidateResponse();
        response.setId(candidate.getCandidateId());
        response.setName(candidate.getName());
        response.setRole(candidate.getRole());
        response.setReadiness(candidate.getReadinessScore());
        response.setStatus(candidate.getStatus());
        response.setSkills(candidate.getSkills());
        response.setLocation(candidate.getLocation());
        response.setApplied(candidate.getAppliedDate() == null ? "" : candidate.getAppliedDate().format(DateTimeFormatter.ofPattern("MMM d")));
        response.setImg(candidate.getProfileImageUrl());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getReadiness() { return readiness; }
    public void setReadiness(Integer readiness) { this.readiness = readiness; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getApplied() { return applied; }
    public void setApplied(String applied) { this.applied = applied; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}
