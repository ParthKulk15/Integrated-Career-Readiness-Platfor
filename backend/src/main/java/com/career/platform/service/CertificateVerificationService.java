package com.career.platform.service;

import com.career.platform.dto.CertificateRequest;
import com.career.platform.dto.CertificateVerificationResult;
import com.career.platform.model.Certificate;
import com.career.platform.repository.CertificateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class CertificateVerificationService {
    private static final Map<String, Pattern> ISSUER_PATTERNS = Map.of(
            "coursera", Pattern.compile("^COURSERA-[A-Z0-9]{6,20}$"),
            "udemy", Pattern.compile("^UC-[A-Z0-9]{8,20}$"),
            "nptel", Pattern.compile("^NPTEL-[A-Z0-9]{6,20}$")
    );

    private final CertificateRepository certificateRepository;

    public CertificateVerificationService(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    public CertificateVerificationResult verify(CertificateRequest request) {
        CertificateVerificationResult result = validate(request);
        if (result.isValid()) {
            persist(request, result);
        }
        return result;
    }

    private CertificateVerificationResult validate(CertificateRequest request) {
        if (isBlank(request.getCertificateName()) || isBlank(request.getIssuer())
                || isBlank(request.getCertificateId()) || isBlank(request.getIssueDate())) {
            return new CertificateVerificationResult(false, "Certificate name, issuer, certificate ID, and issue date are required.");
        }

        String issuerKey = request.getIssuer().trim().toLowerCase(Locale.ROOT);
        Pattern pattern = ISSUER_PATTERNS.get(issuerKey);
        if (pattern == null) {
            return new CertificateVerificationResult(false, "Unsupported issuer. Accepted issuers are Coursera, Udemy, and NPTEL.");
        }

        String certificateId = request.getCertificateId().trim().toUpperCase(Locale.ROOT);
        if (!pattern.matcher(certificateId).matches()) {
            return new CertificateVerificationResult(false, "Certificate ID format is invalid for " + canonicalIssuer(issuerKey) + ".");
        }

        LocalDate issueDate;
        try {
            issueDate = LocalDate.parse(request.getIssueDate().trim());
        } catch (DateTimeParseException ex) {
            return new CertificateVerificationResult(false, "Issue date must use ISO format YYYY-MM-DD.");
        }

        if (issueDate.isAfter(LocalDate.now())) {
            return new CertificateVerificationResult(false, "Issue date cannot be in the future.");
        }

        return new CertificateVerificationResult(true, "Certificate verified successfully with " + canonicalIssuer(issuerKey) + ".");
    }

    private void persist(CertificateRequest request, CertificateVerificationResult result) {
        Certificate certificate = new Certificate();
        certificate.setCandidateId(request.getCandidateId());
        certificate.setCertificateName(request.getCertificateName().trim());
        certificate.setIssuer(canonicalIssuer(request.getIssuer().trim().toLowerCase(Locale.ROOT)));
        certificate.setCertificateId(request.getCertificateId().trim().toUpperCase(Locale.ROOT));
        certificate.setIssueDate(LocalDate.parse(request.getIssueDate().trim()));
        certificate.setCertificateUrl(request.getCertificateURL());
        certificate.setVerified(result.isValid());
        certificate.setVerificationMessage(result.getMessage());
        certificateRepository.save(certificate);
    }

    private String canonicalIssuer(String issuerKey) {
        return switch (issuerKey) {
            case "coursera" -> "Coursera";
            case "udemy" -> "Udemy";
            case "nptel" -> "NPTEL";
            default -> issuerKey;
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
