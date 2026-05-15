package com.career.platform.controller;

import com.career.platform.dto.LoginRequest;
import com.career.platform.model.Student;
import com.career.platform.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(@RequestBody Student student) {
        return studentService.createStudent(student);
    }

    @GetMapping("/students/{id}")
    public Student getStudent(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PutMapping("/students/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student updates) {
        return studentService.updateStudent(id, updates);
    }

    @GetMapping("/students/{id}/score")
    public Map<String, Object> getReadinessScore(@PathVariable Long id) {
        double score = studentService.calculateReadinessScore(id);
        Student student = studentService.getStudentById(id);
        return Map.of(
                "studentId", id,
                "readinessScore", score,
                "confidenceScore", student.getConfidenceScore(),
                "skillCount", student.getSkills().size()
        );
    }

    @PostMapping("/students/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Student student = studentService.login(request.getEmail(), request.getPassword());
        return Map.of(
                "id", student.getStudentId(),
                "name", student.getName(),
                "email", student.getEmail(),
                "role", "student"
        );
    }

    @PostMapping("/students/reset-password")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> body) {
        studentService.resetPassword(body.get("email"), body.get("newPassword"));
        return Map.of("message", "Password reset successfully");
    }
}
