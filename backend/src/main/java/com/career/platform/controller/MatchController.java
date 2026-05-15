package com.career.platform.controller;

import com.career.platform.dto.MatchResult;
import com.career.platform.service.MatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MatchController {
    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/match/{jobId}")
    public List<MatchResult> getMatches(@PathVariable Long jobId) {
        return matchService.getMatches(jobId);
    }
}
