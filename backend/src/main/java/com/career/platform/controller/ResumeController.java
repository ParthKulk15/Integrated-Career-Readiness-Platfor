package com.career.platform.controller;

import com.career.platform.dto.ResumeAnalysisRequest;
import com.career.platform.dto.ResumeAnalysisResult;
import com.career.platform.dto.SkillQuestionsResponse;
import com.career.platform.service.QuestionGeneratorService;
import com.career.platform.service.ResumeAnalysisService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
public class ResumeController {
    private final ResumeAnalysisService resumeAnalysisService;
    private final QuestionGeneratorService questionGeneratorService;

    public ResumeController(ResumeAnalysisService resumeAnalysisService,
                            QuestionGeneratorService questionGeneratorService) {
        this.resumeAnalysisService = resumeAnalysisService;
        this.questionGeneratorService = questionGeneratorService;
    }

    /** Analyze resume from raw text */
    @PostMapping("/resume/analyze")
    public ResumeAnalysisResult analyzeResume(@RequestBody ResumeAnalysisRequest request) {
        return resumeAnalysisService.analyze(request);
    }

    /** Upload resume as file — extract text, analyze, return skills */
    @PostMapping("/resume/upload")
    public ResumeAnalysisResult uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "studentId", required = false) Long studentId) throws IOException {

        String resumeText;
        String originalName = file.getOriginalFilename();

        // Handle PDF files using PDFBox
        if (originalName != null && originalName.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                resumeText = stripper.getText(document);
            }
        } else {
            // For .txt, .doc, .docx — read as UTF-8 text
            resumeText = new String(file.getBytes(), StandardCharsets.UTF_8);
        }

        ResumeAnalysisRequest request = new ResumeAnalysisRequest();
        request.setResumeText(resumeText);
        request.setStudentId(studentId);

        return resumeAnalysisService.analyze(request);
    }

    /** Generate quiz questions based on a student's extracted skills */
    @GetMapping("/resume/questions/{studentId}")
    public SkillQuestionsResponse getQuestionsForStudent(@PathVariable Long studentId,
            @RequestParam(value = "count", defaultValue = "3") int count) {
        var student = resumeAnalysisService.getStudentSkills(studentId);
        return questionGeneratorService.generateQuestions(student, count);
    }

    /** Generate quiz questions for given skill list */
    @PostMapping("/resume/questions")
    public SkillQuestionsResponse generateQuestions(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) body.get("skills");
        int count = body.containsKey("count") ? ((Number) body.get("count")).intValue() : 3;
        return questionGeneratorService.generateQuestions(skills, count);
    }

    /** Get available skills in question bank */
    @GetMapping("/resume/available-skills")
    public Map<String, Object> getAvailableSkills() {
        return Map.of(
                "skills", questionGeneratorService.getAvailableSkills(),
                "totalQuestions", questionGeneratorService.getTotalQuestionCount()
        );
    }
}
