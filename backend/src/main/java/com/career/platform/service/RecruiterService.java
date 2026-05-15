package com.career.platform.service;

import com.career.platform.model.Recruiter;
import com.career.platform.repository.RecruiterRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
public class RecruiterService {
    private final RecruiterRepository recruiterRepository;

    public RecruiterService(RecruiterRepository recruiterRepository) {
        this.recruiterRepository = recruiterRepository;
    }

    public Recruiter createRecruiter(Recruiter recruiter) {
        if (recruiterRepository.existsByEmail(recruiter.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already registered");
        }
        return recruiterRepository.save(recruiter);
    }

    public Recruiter getRecruiterById(Long id) {
        return recruiterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Recruiter not found"));
    }

    public List<Recruiter> getAllRecruiters() {
        return recruiterRepository.findAll();
    }

    public Recruiter login(String email, String password) {
        Recruiter recruiter = recruiterRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password"));
        if (!recruiter.getPassword().equals(password)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
        }
        return recruiter;
    }

    public Recruiter updateRecruiter(Long id, Recruiter updates) {
        Recruiter recruiter = getRecruiterById(id);
        if (updates.getCompanyName() != null) recruiter.setCompanyName(updates.getCompanyName());
        if (updates.getContactName() != null) recruiter.setContactName(updates.getContactName());
        if (updates.getProfileImageUrl() != null) recruiter.setProfileImageUrl(updates.getProfileImageUrl());
        return recruiterRepository.save(recruiter);
    }

    /** Reset password by email */
    public void resetPassword(String email, String newPassword) {
        Recruiter recruiter = recruiterRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "No account found with this email"));
        recruiter.setPassword(newPassword);
        recruiterRepository.save(recruiter);
    }
}
