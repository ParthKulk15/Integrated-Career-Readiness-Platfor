package com.career.platform.dto;

import java.util.List;

/**
 * Interview question generated from student skills.
 */
public class InterviewQuestion {
    private String skill;
    private String question;
    private String difficulty; // Easy, Medium, Hard
    private String tip;
    private String expectedAnswer;
    private List<String> keywords;

    public InterviewQuestion() {}

    public InterviewQuestion(String skill, String question, String difficulty, String tip) {
        this.skill = skill;
        this.question = question;
        this.difficulty = difficulty;
        this.tip = tip;
    }

    public InterviewQuestion(String skill, String question, String difficulty, String tip,
                             String expectedAnswer, List<String> keywords) {
        this.skill = skill;
        this.question = question;
        this.difficulty = difficulty;
        this.tip = tip;
        this.expectedAnswer = expectedAnswer;
        this.keywords = keywords;
    }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }

    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }

    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
}
