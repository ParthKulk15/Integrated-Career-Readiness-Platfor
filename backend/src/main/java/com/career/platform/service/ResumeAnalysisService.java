package com.career.platform.service;

import com.career.platform.dto.ResumeAnalysisRequest;
import com.career.platform.dto.ResumeAnalysisResult;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Resume analysis service — extracts skills via keyword matching
 * and computes an alignment score.
 */
@Service
public class ResumeAnalysisService {

    /** Master list of known skills for keyword matching */
    private static final List<String> KNOWN_SKILLS = List.of(
            // Programming Languages
            "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby",
            // Web & Frontend
            "React", "Angular", "Vue.js", "Next.js", "HTML", "CSS", "Tailwind", "Bootstrap", "jQuery",
            // Backend
            "Spring Boot", "Node.js", "Express.js", "Django", "Flask", "FastAPI", ".NET",
            // Data & ML
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "NLP",
            "Pandas", "NumPy", "Data Science", "Data Analysis", "R",
            // Cloud & DevOps
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Terraform",
            // Databases
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Firebase",
            // Tools & Other
            "Git", "Linux", "REST API", "GraphQL", "Microservices", "Agile", "Scrum",
            "Figma", "Adobe XD", "Jira", "Power BI", "Tableau",
            // Security
            "Cybersecurity", "Penetration Testing", "OWASP",
            // Mobile
            "Android", "iOS", "React Native", "Flutter"
    );

    private final StudentService studentService;

    public ResumeAnalysisService(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Analyze resume text: extract known skills and compute alignment score.
     */
    /**
     * Get a student's extracted skills for question generation.
     */
    public List<String> getStudentSkills(Long studentId) {
        return studentService.getStudentById(studentId).getSkills();
    }

    /**
     * Analyze resume text: extract known skills and compute alignment score.
     */
    public ResumeAnalysisResult analyze(ResumeAnalysisRequest request) {
        String resumeText = request.getResumeText();
        if (resumeText == null || resumeText.isBlank()) {
            return new ResumeAnalysisResult(Collections.emptyList(), 0.0);
        }

        String normalizedResume = resumeText.toLowerCase(Locale.ROOT);

        List<String> extractedSkills = KNOWN_SKILLS.stream()
                .filter(skill -> normalizedResume.contains(skill.toLowerCase(Locale.ROOT)))
                .collect(Collectors.toList());

        double alignmentScore = (extractedSkills.size() * 100.0) / KNOWN_SKILLS.size();
        alignmentScore = Math.round(alignmentScore * 100.0) / 100.0;

        // If student ID is provided, persist extracted skills back to the student
        if (request.getStudentId() != null) {
            studentService.updateSkillsAndResume(request.getStudentId(), extractedSkills, resumeText);
        }

        return new ResumeAnalysisResult(extractedSkills, alignmentScore);
    }
}
