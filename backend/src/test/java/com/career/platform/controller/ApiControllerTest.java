package com.career.platform.controller;

import com.career.platform.dto.ApplicationRequest;
import com.career.platform.dto.ApplicationResponse;
import com.career.platform.dto.CandidateResponse;
import com.career.platform.dto.CertificateVerificationResult;
import com.career.platform.dto.MatchResult;
import com.career.platform.service.ApplicationService;
import com.career.platform.service.CandidateService;
import com.career.platform.service.CertificateVerificationService;
import com.career.platform.service.MatchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({CandidateController.class, ApplicationController.class, MatchController.class, CertificateController.class})
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CandidateService candidateService;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private MatchService matchService;

    @MockBean
    private CertificateVerificationService certificateVerificationService;

    @Test
    void candidatesEndpointReturnsCandidates() throws Exception {
        CandidateResponse candidate = new CandidateResponse();
        candidate.setId(1L);
        candidate.setName("Marcus Webb");
        candidate.setReadiness(94);
        when(candidateService.getCandidates()).thenReturn(List.of(candidate));

        mockMvc.perform(get("/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Marcus Webb"));
    }

    @Test
    void applicationsByJobEndpointReturnsApplications() throws Exception {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(1L);
        response.setJobId(7L);
        response.setName("Anya Sharma");
        when(applicationService.getApplicationsForJob(7L)).thenReturn(List.of(response));

        mockMvc.perform(get("/applications/job/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].jobId").value(7));
    }

    @Test
    void createApplicationEndpointPersistsApplication() throws Exception {
        ApplicationRequest request = new ApplicationRequest();
        request.setStudentId(1L);
        request.setJobId(2L);

        ApplicationResponse response = new ApplicationResponse();
        response.setId(99L);
        response.setStudentId(1L);
        response.setJobId(2L);
        when(applicationService.createApplication(any(ApplicationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99));
    }

    @Test
    void matchEndpointReturnsRankedMatches() throws Exception {
        when(matchService.getMatches(2L)).thenReturn(List.of(
                new MatchResult(1L, "Marcus Webb", 97, List.of("React"), List.of(), 94.0)
        ));

        mockMvc.perform(get("/match/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].matchPercentage").value(97));
    }

    @Test
    void certificateVerificationEndpointReturnsValidationResult() throws Exception {
        when(certificateVerificationService.verify(any())).thenReturn(
                new CertificateVerificationResult(true, "Certificate verified successfully with Coursera.")
        );

        mockMvc.perform(post("/certificates/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "certificateName": "Cloud Architecture",
                                  "issuer": "Coursera",
                                  "certificateId": "COURSERA-A1B2C3D4",
                                  "issueDate": "2025-10-01"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(true))
                .andExpect(jsonPath("$.message").value("Certificate verified successfully with Coursera."));
    }
}
