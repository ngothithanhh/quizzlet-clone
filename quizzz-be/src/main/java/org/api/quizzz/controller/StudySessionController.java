package org.api.quizzz.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.StudySessionAnswerRequest;
import org.api.quizzz.dto.request.StudySessionEndRequest;
import org.api.quizzz.dto.request.StudySessionStartRequest;
import org.api.quizzz.dto.response.StudySessionEndResponse;
import org.api.quizzz.dto.response.StudySessionStartResponse;
import org.api.quizzz.service.StudySessionService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    /**
     * Bắt đầu một phiên học mới.
     * POST /api/study/start
     * Chỉ trả về term của flashcard, chưa trả definition.
     */
    @PostMapping("/start")
    public ResponseEntity<StudySessionStartResponse> startSession(@Valid @RequestBody StudySessionStartRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studySessionService.startSession(userId, request));
    }

    /**
     * Ghi nhận câu trả lời của user cho một flashcard trong session.
     * POST /api/study/answer
     */
    @PostMapping("/answer")
    public ResponseEntity<Void> answerFlashcard(@Valid @RequestBody StudySessionAnswerRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        studySessionService.answerFlashcard(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Kết thúc phiên học và trả về thống kê: total, correct, wrong.
     * POST /api/study/end
     */
    @PostMapping("/end")
    public ResponseEntity<StudySessionEndResponse> endSession(@Valid @RequestBody StudySessionEndRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studySessionService.endSession(userId, request));
    }
}
