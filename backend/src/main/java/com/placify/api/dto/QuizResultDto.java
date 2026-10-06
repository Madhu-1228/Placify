package com.placify.api.dto;

import java.util.ArrayList;
import java.util.List;

public class QuizResultDto {

    private String quizId;
    private String quizTitle;
    private String category;
    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;
    private List<QuestionReviewDto> reviews = new ArrayList<>();

    public QuizResultDto() {
    }

    public static class QuestionReviewDto {
        private int questionId;
        private String questionText;
        private List<String> options;
        private Integer selectedOption;
        private int correctOption;
        private boolean correct;
        private String explanation;

        public QuestionReviewDto() {
        }

        public QuestionReviewDto(int questionId, String questionText, List<String> options, 
                                 Integer selectedOption, int correctOption, boolean correct, String explanation) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.options = options;
            this.selectedOption = selectedOption;
            this.correctOption = correctOption;
            this.correct = correct;
            this.explanation = explanation;
        }

        public int getQuestionId() {
            return questionId;
        }

        public void setQuestionId(int questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public Integer getSelectedOption() {
            return selectedOption;
        }

        public void setSelectedOption(Integer selectedOption) {
            this.selectedOption = selectedOption;
        }

        public int getCorrectOption() {
            return correctOption;
        }

        public void setCorrectOption(int correctOption) {
            this.correctOption = correctOption;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public List<QuestionReviewDto> getReviews() {
        return reviews;
    }

    public void setReviews(List<QuestionReviewDto> reviews) {
        this.reviews = reviews;
    }
}
