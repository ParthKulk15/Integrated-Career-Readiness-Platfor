package com.career.platform.repository;

import com.career.platform.model.InterviewResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for InterviewResult entity.
 */
@Repository
public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {

    /** Find all interview results for a student, ordered by most recent first */
    List<InterviewResult> findByStudentIdOrderByTimestampDesc(Long studentId);
}
