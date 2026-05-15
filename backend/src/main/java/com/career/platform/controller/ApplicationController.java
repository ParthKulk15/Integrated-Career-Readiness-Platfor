package com.career.platform.controller;

import com.career.platform.dto.ApplicationRequest;
import com.career.platform.dto.ApplicationResponse;
import com.career.platform.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/applications/job/{jobId}")
    public List<ApplicationResponse> getApplicationsForJob(@PathVariable Long jobId) {
        return applicationService.getApplicationsForJob(jobId);
    }

    @GetMapping("/applications/student/{studentId}")
    public List<ApplicationResponse> getStudentApplications(@PathVariable Long studentId) {
        return applicationService.getStudentApplications(studentId);
    }

    @GetMapping("/applications/recent")
    public List<ApplicationResponse> getRecentApplications() {
        return applicationService.getRecentApplications();
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse createApplication(@Valid @RequestBody ApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    @DeleteMapping("/applications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
    }

    @PutMapping("/applications/{id}/schedule")
    public ApplicationResponse scheduleInterview(@PathVariable Long id, @RequestBody Map<String, Object> details) {
        return applicationService.scheduleInterview(id, details);
    }
}
