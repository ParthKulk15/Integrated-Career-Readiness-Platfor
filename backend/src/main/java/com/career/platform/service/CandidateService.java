package com.career.platform.service;

import com.career.platform.dto.CandidateResponse;
import com.career.platform.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class CandidateService {
    private final CandidateRepository candidateRepository;

    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    public List<CandidateResponse> getCandidates() {
        return candidateRepository.findAll().stream()
                .sorted(Comparator.comparing(candidate -> -candidate.getReadinessScore()))
                .map(CandidateResponse::from)
                .toList();
    }
}
