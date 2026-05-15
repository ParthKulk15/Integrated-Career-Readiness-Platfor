package com.career.platform.repository;

import com.career.platform.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA Repository for Recruiter entity.
 */
@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {

    /** Find recruiter by email (for login) */
    Optional<Recruiter> findByEmail(String email);

    boolean existsByEmail(String email);
}
