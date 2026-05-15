package com.career.platform.controller;

import com.career.platform.dto.JobResponse;
import com.career.platform.model.Job;
import com.career.platform.repository.JobRepository;
import com.career.platform.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class JobController {
    private final JobService jobService;
    private final JobRepository jobRepository;

    public JobController(JobService jobService, JobRepository jobRepository) {
        this.jobService = jobService;
        this.jobRepository = jobRepository;
    }

    @GetMapping("/jobs")
    public List<JobResponse> getJobs() {
        return jobService.getJobs();
    }

    @PostMapping("/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public Job createJob(@RequestBody Job job) {
        if (job.getApplicants() == null) job.setApplicants(0);
        if (job.getOpenings() == null) job.setOpenings(1);
        if (job.getFeatured() == null) job.setFeatured(false);
        if (job.getDisplayMatchScore() == null) job.setDisplayMatchScore(0);
        return jobRepository.save(job);
    }

    @GetMapping("/jobs/recruiter/{recruiterId}")
    public List<JobResponse> getJobsByRecruiter(@PathVariable Long recruiterId) {
        return jobService.getJobsByRecruiter(recruiterId);
    }

    @DeleteMapping("/jobs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteJob(@PathVariable Long id) {
        jobRepository.deleteById(id);
    }
}

