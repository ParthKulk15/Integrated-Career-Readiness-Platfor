package com.career.platform.repository;

import com.career.platform.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for Student entity.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /** Find student by email (for login) */
    Optional<Student> findByEmail(String email);

    /** Check if email already exists */
    boolean existsByEmail(String email);

    /** Find students with readiness score above a threshold */
    List<Student> findByReadinessScoreGreaterThanEqual(Double score);

    /** Calculate average readiness score across all students */
    @Query("SELECT COALESCE(AVG(s.readinessScore), 0) FROM Student s")
    Double findAverageReadinessScore();
}
