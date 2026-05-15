package com.career.platform.model;

import jakarta.persistence.*;

/**
 * Recruiter entity — represents a recruiter/employer user.
 */
@Entity
@Table(name = "recruiters")
public class Recruiter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recruiterId;

    @Column(nullable = false)
    private String companyName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String contactName;

    @Column(columnDefinition = "TEXT")
    private String profileImageUrl;

    // ===== Constructors =====
    public Recruiter() {}

    public Recruiter(String companyName, String email, String password) {
        this.companyName = companyName;
        this.email = email;
        this.password = password;
    }

    // ===== Getters & Setters =====
    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}
