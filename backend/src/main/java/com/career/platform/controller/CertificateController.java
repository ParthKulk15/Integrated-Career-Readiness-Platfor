package com.career.platform.controller;

import com.career.platform.dto.CertificateRequest;
import com.career.platform.dto.CertificateVerificationResult;
import com.career.platform.service.CertificateVerificationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CertificateController {
    private final CertificateVerificationService certificateVerificationService;

    public CertificateController(CertificateVerificationService certificateVerificationService) {
        this.certificateVerificationService = certificateVerificationService;
    }

    @PostMapping("/certificates/verify")
    public CertificateVerificationResult verifyCertificate(@RequestBody CertificateRequest request) {
        return certificateVerificationService.verify(request);
    }
}
