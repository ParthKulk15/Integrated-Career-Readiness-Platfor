package com.career.platform.dto;

import java.util.List;

/**
 * DTO representing a skill-based question for interview practice.
 */
public class SkillQuestion {
    private String skill;
    private String question;
    private List<String> options;
    private int correctIndex;
    private String explanation;

    public SkillQuestion() {}

    public SkillQuestion(String skill, String question, List<String> options, int correctIndex, String explanation) {
        this.skill = skill;
        this.question = question;
        this.options = options;
        this.correctIndex = correctIndex;
        this.explanation = explanation;
    }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public int getCorrectIndex() { return correctIndex; }
    public void setCorrectIndex(int correctIndex) { this.correctIndex = correctIndex; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
