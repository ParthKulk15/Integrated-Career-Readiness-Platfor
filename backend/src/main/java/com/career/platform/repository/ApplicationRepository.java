package com.career.platform.repository;

import com.career.platform.model.Application;
import com.career.platform.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * JPA Repository for Application entity.
 */
@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /** Find all applications for a specific job */
    List<Application> findByJobId(Long jobId);

    /** Find all applications by a candidate */
    List<Application> findByCandidateId(Long candidateId);

    /** Find applications by status */
    List<Application> findByStatus(ApplicationStatus status);

    /** Count applications by status */
    long countByStatus(ApplicationStatus status);

    /** Count applications after a given time (for "new today" stats) */
    long countByAppliedTimeAfter(LocalDateTime time);

    /** Find applications for a job with a specific status */
    List<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status);
}
