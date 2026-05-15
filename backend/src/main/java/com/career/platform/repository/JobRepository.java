package com.career.platform.repository;

import com.career.platform.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Job entity.
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /** Find all jobs posted by a specific recruiter */
    List<Job> findByRecruiterId(Long recruiterId);
}
