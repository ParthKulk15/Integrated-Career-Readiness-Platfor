package com.career.platform.dto;

import com.career.platform.model.Job;

import java.util.List;

public class JobResponse {
    private Long id;
    private String title;
    private String company;
    private String location;
    private Integer match;
    private List<String> skills;
    private Boolean featured;
    private String department;
    private Integer openings;
    private Integer applicants;
    private String description;

    public static JobResponse from(Job job) {
        return from(job, job.getApplicants() != null ? job.getApplicants() : 0);
    }

    /** Create a JobResponse with a dynamically counted applicant count */
    public static JobResponse from(Job job, int applicantCount) {
        JobResponse response = new JobResponse();
        response.setId(job.getJobId());
        response.setTitle(job.getJobRole());
        response.setCompany(job.getCompanyName());
        response.setLocation(job.getLocation());
        response.setMatch(job.getDisplayMatchScore());
        response.setSkills(job.getRequiredSkills());
        response.setFeatured(job.getFeatured());
        response.setDepartment(job.getDepartment());
        response.setOpenings(job.getOpenings() != null ? job.getOpenings() : 1);
        response.setApplicants(applicantCount);
        response.setDescription(job.getDescription());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getMatch() { return match; }
    public void setMatch(Integer match) { this.match = match; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public Integer getApplicants() { return applicants; }
    public void setApplicants(Integer applicants) { this.applicants = applicants; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
