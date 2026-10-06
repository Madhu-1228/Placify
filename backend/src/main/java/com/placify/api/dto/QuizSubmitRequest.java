package com.placify.api.dto;

import java.util.HashMap;
import java.util.Map;

public class QuizSubmitRequest {

    // Map of question ID to chosen option index (0-based)
    private Map<Integer, Integer> answers = new HashMap<>();

    public QuizSubmitRequest() {
    }

    public QuizSubmitRequest(Map<Integer, Integer> answers) {
        this.answers = answers;
    }

    public Map<Integer, Integer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Integer, Integer> answers) {
        this.answers = answers;
    }
}
