package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.StudySessionResponse;
import org.api.quizzz.entity.StudySession;
import org.springframework.stereotype.Component;

@Component
public class StudySessionMapper {
    public static StudySessionResponse mapToResponse(StudySession s) {
        var studySet = s.getStudySet();

        Long studySetId = (studySet != null) ? studySet.getId() : null;
        String studySetTitle = (studySet != null) ? studySet.getTitle() : null;

        int total = (s.getTotalQuestions() != null) ? s.getTotalQuestions() : 0;
        int correct = (s.getCorrectAnswers() != null) ? s.getCorrectAnswers() : 0;

        double accuracy = (s.getTotalQuestions() == 0)
                ? 0
                : (double) s.getCorrectAnswers() / s.getTotalQuestions() * 100;

        return StudySessionResponse.builder()
                .id(s.getId())
                .studySetId(studySetId)
                .studySetTitle(studySetTitle)
                .mode(s.getMode().name())
                .totalQuestions(total)
                .correctAnswers(correct)
                .accuracy(accuracy)
                .startedAt(s.getStartedAt())
                .endedAt(s.getEndedAt())
                .build();
    }
}
