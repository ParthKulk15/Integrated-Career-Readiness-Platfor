package com.career.platform.controller;

import com.career.platform.dto.LoginRequest;
import com.career.platform.model.Recruiter;
import com.career.platform.service.RecruiterService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RecruiterController {
    private final RecruiterService recruiterService;

    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    @PostMapping("/recruiters")
    @ResponseStatus(HttpStatus.CREATED)
    public Recruiter createRecruiter(@RequestBody Recruiter recruiter) {
        return recruiterService.createRecruiter(recruiter);
    }

    @GetMapping("/recruiters/{id}")
    public Recruiter getRecruiter(@PathVariable Long id) {
        return recruiterService.getRecruiterById(id);
    }

    @GetMapping("/recruiters")
    public List<Recruiter> getAllRecruiters() {
        return recruiterService.getAllRecruiters();
    }

    @PutMapping("/recruiters/{id}")
    public Recruiter updateRecruiter(@PathVariable Long id, @RequestBody Recruiter updates) {
        return recruiterService.updateRecruiter(id, updates);
    }

    @PostMapping("/recruiters/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Recruiter recruiter = recruiterService.login(request.getEmail(), request.getPassword());
        return Map.of(
                "id", recruiter.getRecruiterId(),
                "companyName", recruiter.getCompanyName(),
                "email", recruiter.getEmail(),
                "role", "recruiter"
        );
    }

    @PostMapping("/recruiters/reset-password")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> body) {
        recruiterService.resetPassword(body.get("email"), body.get("newPassword"));
        return Map.of("message", "Password reset successfully");
    }
}
