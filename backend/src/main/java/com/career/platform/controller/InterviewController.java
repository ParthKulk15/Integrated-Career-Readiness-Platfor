package com.career.platform.controller;

import com.career.platform.dto.InterviewQuestion;
import com.career.platform.model.InterviewResult;
import com.career.platform.service.InterviewQuestionService;
import com.career.platform.service.InterviewService;
import com.career.platform.service.ResumeAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class InterviewController {
    private final InterviewService interviewService;
    private final InterviewQuestionService interviewQuestionService;
    private final ResumeAnalysisService resumeAnalysisService;

    public InterviewController(InterviewService interviewService,
                               InterviewQuestionService interviewQuestionService,
                               ResumeAnalysisService resumeAnalysisService) {
        this.interviewService = interviewService;
        this.interviewQuestionService = interviewQuestionService;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    /** Start a mock interview simulation */
    @PostMapping("/interview/start/{studentId}")
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResult startInterview(
            @PathVariable Long studentId,
            @RequestBody(required = false) Map<String, String> body) {
        String category = (body != null) ? body.get("category") : null;
        return interviewService.simulateInterview(studentId, category);
    }

    /** Get interview history */
    @GetMapping("/interview/{studentId}")
    public List<InterviewResult> getHistory(@PathVariable Long studentId) {
        return interviewService.getHistory(studentId);
    }

    private static final int TARGET_QUESTION_COUNT = 15;

    /** Generate interview questions based on student's resume skills */
    @GetMapping("/interview/questions/{studentId}")
    public List<InterviewQuestion> getInterviewQuestions(
            @PathVariable Long studentId,
            @RequestParam(value = "count", defaultValue = "15") int count) {
        List<String> skills = resumeAnalysisService.getStudentSkills(studentId);
        if (skills == null || skills.isEmpty()) {
            return getGeneralFallbackQuestions();
        }
        // Calculate per-skill count to reach ~15 total questions
        int perSkill = (int) Math.ceil((double) TARGET_QUESTION_COUNT / skills.size());
        List<InterviewQuestion> questions = interviewQuestionService.generateForSkills(skills, perSkill);
        // Trim to exactly 15 if we got more
        if (questions.size() > TARGET_QUESTION_COUNT) {
            questions = questions.subList(0, TARGET_QUESTION_COUNT);
        }
        return questions;
    }

    /** 15 general fallback questions for students without resume skills */
    private List<InterviewQuestion> getGeneralFallbackQuestions() {
        return List.of(
            new InterviewQuestion("General",
                "Tell me about yourself and your career goals.",
                "Easy", "Structure: background, current focus, future goals."),
            new InterviewQuestion("General",
                "What are your greatest strengths and how do they apply to your target role?",
                "Easy", "Pick 2-3 strengths with concrete examples."),
            new InterviewQuestion("General",
                "Describe a challenging project you worked on and how you handled it.",
                "Medium", "Use the STAR method: Situation, Task, Action, Result."),
            new InterviewQuestion("Behavioral",
                "Tell me about a time you had to work with a difficult team member.",
                "Medium", "Focus on communication, empathy, and resolution."),
            new InterviewQuestion("Behavioral",
                "Describe a situation where you had to meet a tight deadline.",
                "Medium", "Highlight prioritization, time management, and outcome."),
            new InterviewQuestion("Problem Solving",
                "How do you approach solving a problem you've never encountered before?",
                "Medium", "Discuss research, breaking down the problem, and iteration."),
            new InterviewQuestion("Communication",
                "How would you explain a complex technical concept to a non-technical person?",
                "Easy", "Use analogies, simple language, and check understanding."),
            new InterviewQuestion("General",
                "Where do you see yourself in 5 years?",
                "Easy", "Align your goals with growth in the field."),
            new InterviewQuestion("General",
                "Why should we hire you over other candidates?",
                "Medium", "Highlight unique skills, passion, and what you bring to the team."),
            new InterviewQuestion("Behavioral",
                "Tell me about a time you failed and what you learned from it.",
                "Medium", "Be honest, focus on the lesson and how you improved."),
            new InterviewQuestion("Problem Solving",
                "How do you prioritize tasks when you have multiple deadlines?",
                "Easy", "Discuss urgency vs importance, tools, and communication."),
            new InterviewQuestion("Leadership",
                "Describe a time when you took initiative on a project without being asked.",
                "Medium", "Show proactiveness, ownership, and impact."),
            new InterviewQuestion("General",
                "What motivates you to do your best work?",
                "Easy", "Be genuine — connect to learning, impact, or collaboration."),
            new InterviewQuestion("Behavioral",
                "How do you handle feedback or criticism?",
                "Medium", "Show openness to growth and give a concrete example."),
            new InterviewQuestion("General",
                "Do you have any questions for us?",
                "Easy", "Always prepare thoughtful questions about the role, team, or company culture.")
        );
    }

    /** Generate interview questions for arbitrary skill list */
    @PostMapping("/interview/questions")
    public List<InterviewQuestion> generateQuestions(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) body.get("skills");
        int count = body.containsKey("count") ? ((Number) body.get("count")).intValue() : 2;
        return interviewQuestionService.generateForSkills(skills, count);
    }
}
