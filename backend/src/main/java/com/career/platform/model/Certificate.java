package com.career.platform.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long certificatePk;

    private Long candidateId;

    @Column(nullable = false)
    private String certificateName;

    @Column(nullable = false)
    private String issuer;

    @Column(nullable = false)
    private String certificateId;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(columnDefinition = "TEXT")
    private String certificateUrl;

    private Boolean verified = false;

    @Column(columnDefinition = "TEXT")
    private String verificationMessage;

    public Certificate() {}

    public Long getCertificatePk() { return certificatePk; }
    public void setCertificatePk(Long certificatePk) { this.certificatePk = certificatePk; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCertificateName() { return certificateName; }
    public void setCertificateName(String certificateName) { this.certificateName = certificateName; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public String getVerificationMessage() { return verificationMessage; }
    public void setVerificationMessage(String verificationMessage) { this.verificationMessage = verificationMessage; }
}
