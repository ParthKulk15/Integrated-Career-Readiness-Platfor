package com.career.platform.service;

import com.career.platform.dto.JobResponse;
import com.career.platform.repository.ApplicationRepository;
import com.career.platform.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public JobService(JobRepository jobRepository, ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public List<JobResponse> getJobs() {
        return jobRepository.findAll().stream()
                .map(job -> JobResponse.from(job, applicationRepository.findByJobId(job.getJobId()).size()))
                .toList();
    }

    public List<JobResponse> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId).stream()
                .map(job -> JobResponse.from(job, applicationRepository.findByJobId(job.getJobId()).size()))
                .toList();
    }
}
