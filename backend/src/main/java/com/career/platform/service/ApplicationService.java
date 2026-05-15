package com.career.platform.service;

import com.career.platform.dto.ApplicationRequest;
import com.career.platform.dto.ApplicationResponse;
import com.career.platform.model.*;
import com.career.platform.repository.*;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final NotificationRepository notificationRepository;

    public ApplicationService(ApplicationRepository applicationRepository, StudentRepository studentRepository,
                              JobRepository jobRepository, NotificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .sorted(Comparator.comparing(Application::getAppliedTime).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicationResponse> getRecentApplications() {
        return applicationRepository.findAll().stream()
                .sorted(Comparator.comparing(Application::getAppliedTime).reversed())
                .limit(8)
                .map(this::toResponse)
                .toList();
    }

    /** Get all applications for a specific student */
    public List<ApplicationResponse> getStudentApplications(Long studentId) {
        return applicationRepository.findByCandidateId(studentId).stream()
                .sorted(Comparator.comparing(Application::getAppliedTime).reversed())
                .map(this::toResponse)
                .toList();
    }

    public ApplicationResponse createApplication(@Valid ApplicationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Job not found"));

        // Check if already applied
        boolean alreadyApplied = applicationRepository.findByCandidateId(student.getStudentId()).stream()
                .anyMatch(a -> a.getJobId().equals(job.getJobId()));
        if (alreadyApplied) {
            throw new ResponseStatusException(CONFLICT, "You have already applied to this job");
        }

        Application application = new Application(student.getStudentId(), job.getJobId());
        // Simple match: count how many student skills match job required skills
        long matchingSkills = student.getSkills().stream()
                .filter(s -> job.getRequiredSkills().stream().anyMatch(rs -> rs.equalsIgnoreCase(s)))
                .count();
        double matchScore = job.getRequiredSkills().isEmpty() ? 0 :
                (matchingSkills * 100.0) / job.getRequiredSkills().size();
        application.setMatchScore(matchScore);

        return toResponse(applicationRepository.save(application));
    }

    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Application not found");
        }
        applicationRepository.deleteById(id);
    }

    public ApplicationResponse scheduleInterview(Long id, Map<String, Object> details) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Application not found"));

        String dateStr = (String) details.get("interviewDate");
        String link = (String) details.get("interviewLink");
        Long recruiterId = null;
        if (details.get("recruiterId") != null) {
            recruiterId = Long.valueOf(details.get("recruiterId").toString());
        }

        String formattedDate = dateStr;
        if (dateStr != null) {
            LocalDateTime dt = LocalDateTime.parse(dateStr);
            application.setInterviewDate(dt);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");
            formattedDate = dt.format(formatter);
        }
        application.setInterviewLink(link);
        application.setStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(application);

        // Send notification
        String message = "Your interview for job #" + application.getJobId() + " has been scheduled for " + formattedDate + ". Link: " + link;
        Notification notification = new Notification(application.getCandidateId(), recruiterId, message, "INTERVIEW_SCHEDULED");
        notificationRepository.save(notification);
        System.out.println("Notification saved for student: " + application.getCandidateId() + " type: INTERVIEW_SCHEDULED");

        return toResponse(application);
    }

    private ApplicationResponse toResponse(Application application) {
        Student student = studentRepository.findById(application.getCandidateId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
        return ApplicationResponse.from(application, student);
    }
}
