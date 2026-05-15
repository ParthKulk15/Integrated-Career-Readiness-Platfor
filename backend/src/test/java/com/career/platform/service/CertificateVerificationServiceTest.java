package com.career.platform.service;

import com.career.platform.dto.CertificateRequest;
import com.career.platform.dto.CertificateVerificationResult;
import com.career.platform.repository.CertificateRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class CertificateVerificationServiceTest {

    private final CertificateRepository certificateRepository = mock(CertificateRepository.class);
    private final CertificateVerificationService service = new CertificateVerificationService(certificateRepository);

    @Test
    void validatesCourseraCertificate() {
        CertificateVerificationResult result = service.verify(request("Coursera", "COURSERA-A1B2C3D4", "2025-10-01"));

        assertThat(result.isValid()).isTrue();
        assertThat(result.getMessage()).contains("Coursera");
        verify(certificateRepository).save(any());
    }

    @Test
    void rejectsMissingFields() {
        CertificateVerificationResult result = service.verify(request("", "COURSERA-A1B2C3D4", "2025-10-01"));

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("required");
        verify(certificateRepository, never()).save(any());
    }

    @Test
    void rejectsUnsupportedIssuer() {
        CertificateVerificationResult result = service.verify(request("LinkedIn", "COURSERA-A1B2C3D4", "2025-10-01"));

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("Unsupported issuer");
    }

    @Test
    void rejectsBadIssuerSpecificFormat() {
        CertificateVerificationResult result = service.verify(request("Udemy", "COURSERA-A1B2C3D4", "2025-10-01"));

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("format");
    }

    @Test
    void rejectsFutureIssueDate() {
        CertificateVerificationResult result = service.verify(request("NPTEL", "NPTEL-A1B2C3D4", LocalDate.now().plusDays(1).toString()));

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("future");
    }

    private CertificateRequest request(String issuer, String certificateId, String issueDate) {
        CertificateRequest request = new CertificateRequest();
        request.setCertificateName("Cloud Architecture");
        request.setIssuer(issuer);
        request.setCertificateId(certificateId);
        request.setIssueDate(issueDate);
        return request;
    }
}
