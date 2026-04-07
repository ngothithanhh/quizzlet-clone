package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudySessionAnswerRequest {
    @NotNull(message = "Session ID không được để trống")
    private Long sessionId;

    @NotNull(message = "Flashcard ID không được để trống")
    private Long flashcardId;

    @NotNull(message = "Kết quả correctAnswer/wrong không được để trống")
    private Boolean isCorrect;
    
    // Tuỳ chọn để lưu lại câu trả lời text
    private String userAnswer;
}
