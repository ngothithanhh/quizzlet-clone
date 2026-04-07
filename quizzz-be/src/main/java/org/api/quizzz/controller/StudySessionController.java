package org.api.quizzz.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.StudySessionAnswerRequest;
import org.api.quizzz.dto.request.StudySessionEndRequest;
import org.api.quizzz.dto.request.StudySessionStartRequest;
import org.api.quizzz.dto.response.StudySessionEndResponse;
import org.api.quizzz.dto.response.StudySessionStartResponse;
import org.api.quizzz.service.StudySessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    // TODO: Thay bằng principal khi làm Authentication
    private final Long MOCK_USER_ID = 1L;

    @PostMapping("/start")
    public ResponseEntity<StudySessionStartResponse> startSession(@Valid @RequestBody StudySessionStartRequest request) {
        return ResponseEntity.ok(studySessionService.startSession(MOCK_USER_ID, request));
    }

    @PostMapping("/answer")
    public ResponseEntity<Void> answerFlashcard(@Valid @RequestBody StudySessionAnswerRequest request) {
        studySessionService.answerFlashcard(MOCK_USER_ID, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/end")
    public ResponseEntity<StudySessionEndResponse> endSession(@Valid @RequestBody StudySessionEndRequest request) {
        return ResponseEntity.ok(studySessionService.endSession(MOCK_USER_ID, request));
    }
}
