package com.career.platform.service;

import com.career.platform.dto.MatchResult;
import com.career.platform.model.Candidate;
import com.career.platform.model.Job;
import com.career.platform.repository.CandidateRepository;
import com.career.platform.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MatchService {
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;

    public MatchService(CandidateRepository candidateRepository, JobRepository jobRepository) {
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
    }

    public List<MatchResult> getMatches(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Job not found"));

        return candidateRepository.findAll().stream()
                .map(candidate -> toMatch(candidate, job))
                .sorted(Comparator.comparing(MatchResult::getMatchPercentage).reversed())
                .toList();
    }

    public double calculateMatchScore(Candidate candidate, Job job) {
        if (job.getRequiredSkills().isEmpty()) {
            return candidate.getReadinessScore();
        }
        Set<String> candidateSkills = normalize(candidate.getSkills());
        long matched = normalize(job.getRequiredSkills()).stream()
                .filter(candidateSkills::contains)
                .count();
        double skillScore = matched * 100.0 / job.getRequiredSkills().size();
        return Math.round((skillScore * 0.7) + (candidate.getReadinessScore() * 0.3));
    }

    private MatchResult toMatch(Candidate candidate, Job job) {
        Set<String> candidateSkills = normalize(candidate.getSkills());
        List<String> matchedSkills = job.getRequiredSkills().stream()
                .filter(skill -> candidateSkills.contains(normalize(skill)))
                .toList();
        List<String> missingSkills = job.getRequiredSkills().stream()
                .filter(skill -> !candidateSkills.contains(normalize(skill)))
                .toList();

        MatchResult result = new MatchResult(
                candidate.getCandidateId(),
                candidate.getName(),
                calculateMatchScore(candidate, job),
                matchedSkills,
                missingSkills,
                candidate.getReadinessScore().doubleValue()
        );
        result.setCandidateName(candidate.getName());
        result.setRole(candidate.getRole());
        result.setImg(candidate.getProfileImageUrl());
        return result;
    }

    private Set<String> normalize(List<String> values) {
        return values.stream()
                .map(this::normalize)
                .collect(Collectors.toSet());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
