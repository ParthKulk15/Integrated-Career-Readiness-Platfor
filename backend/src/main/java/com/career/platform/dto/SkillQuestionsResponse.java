package com.career.platform.dto;

import java.util.List;

/**
 * Response DTO containing generated questions for a set of skills.
 */
public class SkillQuestionsResponse {
    private List<String> skills;
    private List<SkillQuestion> questions;
    private int totalQuestions;

    public SkillQuestionsResponse() {}

    public SkillQuestionsResponse(List<String> skills, List<SkillQuestion> questions) {
        this.skills = skills;
        this.questions = questions;
        this.totalQuestions = questions.size();
    }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<SkillQuestion> getQuestions() { return questions; }
    public void setQuestions(List<SkillQuestion> questions) { this.questions = questions; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
}
