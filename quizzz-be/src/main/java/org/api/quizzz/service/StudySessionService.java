package org.api.quizzz.service;

import org.api.quizzz.dto.response.StudySessionResponse;
import org.springframework.data.domain.Page;
import org.api.quizzz.dto.request.StudySessionAnswerRequest;
import org.api.quizzz.dto.request.StudySessionEndRequest;
import org.api.quizzz.dto.request.StudySessionStartRequest;
import org.api.quizzz.dto.response.StudySessionEndResponse;
import org.api.quizzz.dto.response.StudySessionStartResponse;

public interface StudySessionService {
    Page<StudySessionResponse> getMySessions(
            int page,
            int size,
            String mode,
            String from,
            String to
    );
    StudySessionStartResponse startSession(Long userId, StudySessionStartRequest request);
    void answerFlashcard(Long userId, StudySessionAnswerRequest request);
    StudySessionEndResponse endSession(Long userId, StudySessionEndRequest request);
}
