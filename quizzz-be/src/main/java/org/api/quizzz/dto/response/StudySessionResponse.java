package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;
import org.api.quizzz.entity.StudySession;

import java.time.LocalDateTime;

@Data
@Builder
public class StudySessionResponse {
    Long id;
    Long studySetId;
    String studySetTitle;
    String mode;
    int correctAnswers;
    int totalQuestions;
    double accuracy;
    LocalDateTime startedAt;
    LocalDateTime endedAt;



    
}
