package com.career.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Result DTO for certificate verification — multi-step validation result.
 */
public class CertificateVerificationResult {
    @JsonProperty("isValid")
    private boolean valid;
    private String message;

    public CertificateVerificationResult() {}

    public CertificateVerificationResult(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
