package com.career.platform.dto;

/**
 * Request DTO for certificate verification.
 */
public class CertificateRequest {
    private Long candidateId;
    private String certificateName;
    private String issuer;
    private String certificateId;
    private String issueDate;
    private String certificateURL; // optional

    public CertificateRequest() {}

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCertificateName() { return certificateName; }
    public void setCertificateName(String certificateName) { this.certificateName = certificateName; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getCertificateURL() { return certificateURL; }
    public void setCertificateURL(String certificateURL) { this.certificateURL = certificateURL; }
}
