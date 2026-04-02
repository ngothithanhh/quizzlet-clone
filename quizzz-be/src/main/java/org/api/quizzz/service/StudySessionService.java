package org.api.quizzz.service;

import org.api.quizzz.dto.response.StudySessionResponse;
import org.springframework.data.domain.Page;

public interface StudySessionService {
    Page<StudySessionResponse> getMySessions(
            int page,
            int size,
            String mode,
            String from,
            String to
    );
}
