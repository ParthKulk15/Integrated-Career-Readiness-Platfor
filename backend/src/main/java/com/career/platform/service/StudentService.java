package com.career.platform.service;

import com.career.platform.model.Student;
import com.career.platform.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@Service
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already registered");
        }
        return studentRepository.save(student);
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student login(String email, String password) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password"));
        if (!student.getPassword().equals(password)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
        }
        return student;
    }

    public Student updateStudent(Long id, Student updates) {
        Student student = getStudentById(id);
        if (updates.getName() != null) student.setName(updates.getName());
        if (updates.getTargetRole() != null) student.setTargetRole(updates.getTargetRole());
        if (updates.getLocation() != null) student.setLocation(updates.getLocation());
        if (updates.getProfileImageUrl() != null) student.setProfileImageUrl(updates.getProfileImageUrl());
        if (updates.getSkills() != null && !updates.getSkills().isEmpty()) student.setSkills(updates.getSkills());
        Student saved = studentRepository.save(student);
        calculateReadinessScore(id);
        return saved;
    }

    /**
     * Calculate readiness score based on:
     * - Number of skills (40%)
     * - Confidence score (30%)
     * - Resume completeness (30%)
     */
    public double calculateReadinessScore(Long studentId) {
        Student student = getStudentById(studentId);

        double skillScore = Math.min(student.getSkills().size() * 5.0, 100.0);
        double confidenceScore = student.getConfidenceScore() != null ? student.getConfidenceScore() : 0.0;
        
        double resumeScore = 0.0;
        if (student.getResumeText() != null && !student.getResumeText().isBlank()) {
            resumeScore = Math.min((student.getResumeText().length() / 1500.0) * 100.0, 100.0);
        }

        double readiness = (skillScore * 0.4) + (confidenceScore * 0.3) + (resumeScore * 0.3);
        readiness = Math.round(readiness * 10.0) / 10.0;

        student.setReadinessScore(readiness);
        studentRepository.save(student);
        return readiness;
    }

    /** Reset password by email */
    public void resetPassword(String email, String newPassword) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "No account found with this email"));
        student.setPassword(newPassword);
        studentRepository.save(student);
    }

    /** Update skills on the student record (called after resume analysis) */
    public void updateSkillsAndResume(Long studentId, List<String> skills, String resumeText) {
        Student student = getStudentById(studentId);
        student.setSkills(skills);
        student.setResumeText(resumeText);
        studentRepository.save(student);
        calculateReadinessScore(studentId);
    }
}
