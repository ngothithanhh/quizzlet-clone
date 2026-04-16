package org.api.quizzz.dto.request.classroom;

import lombok.Data;
import java.util.List;

@Data
public class SubmitAssignmentRequest {
    private Long assignmentId;
    /** Điểm số (0-100) */
    private Integer score;
    /** Số câu đúng */
    private Integer correctAnswers;
    /** Tổng số câu hỏi */
    private Integer totalQuestions;
    /** Thời gian hoàn thành (giây) */
    private Integer durationSeconds;
    /** Chi tiết từng câu trả lời */
    private List<AnswerDetail> answers;

    @Data
    public static class AnswerDetail {
        private Long flashcardId;
        private String term;
        private String userAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
    }
}
