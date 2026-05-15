package com.career.platform.repository;

import com.career.platform.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Notification entity.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Find all notifications for a student, newest first */
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    /** Count unread notifications for a student */
    long countByStudentIdAndReadFalse(Long studentId);

    /** Find all notifications for a recruiter, newest first */
    List<Notification> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    /** Count unread notifications for a recruiter */
    long countByRecruiterIdAndReadFalse(Long recruiterId);
}
