package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.FlashcardTermDTO;
import org.api.quizzz.dto.request.StudySessionAnswerRequest;
import org.api.quizzz.dto.request.StudySessionEndRequest;
import org.api.quizzz.dto.request.StudySessionStartRequest;
import org.api.quizzz.dto.response.StudySessionEndResponse;
import org.api.quizzz.dto.response.StudySessionResponse;
import org.api.quizzz.dto.response.StudySessionStartResponse;
import org.api.quizzz.entity.*;
import org.api.quizzz.enums.StudyMode;
import org.api.quizzz.mapper.StudySessionMapper;
import org.api.quizzz.repository.*;
import org.api.quizzz.service.StudySessionService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final StudySessionMapper studySessionMapper;
    private final StudySessionDetailRepository studySessionDetailRepository;
    private final StudySetRepository studySetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StudySessionStartResponse startSession(Long userId, StudySessionStartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudySet studySet = studySetRepository.findById(request.getStudySetId())
                .orElseThrow(() -> new RuntimeException("StudySet not found"));

        StudyMode mode = request.getMode() != null ? request.getMode() : StudyMode.FLASHCARD;

        StudySession session = StudySession.builder()
                .user(user)
                .studySet(studySet)
                .mode(mode)
                .build();

        StudySession savedSession = studySessionRepository.save(session);

        List<Flashcard> flashcards = flashcardRepository.findByStudySetIdOrderByPositionAsc(studySet.getId());
        List<FlashcardTermDTO> flashcardDTOs = flashcards.stream()
                .map(fc -> FlashcardTermDTO.builder()
                        .id(fc.getId())
                        .term(fc.getTerm())
                        .build())
                .collect(Collectors.toList());

        return StudySessionStartResponse.builder()
                .sessionId(savedSession.getId())
                .flashcards(flashcardDTOs)
                .build();
    }

    @Override
    public Page<StudySessionResponse> getMySessions(
            int page,
            int size,
            String mode,
            String from,
            String to
    ) {
        Long userId = SecurityUtils.getCurrentUserId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"));

        StudyMode studyMode = (mode != null) ? StudyMode.valueOf(mode) : null;
        LocalDateTime fromDate = (from != null) ? LocalDateTime.parse(from) : null;
        LocalDateTime toDate = (to != null) ? LocalDateTime.parse(to) : null;

        Page<StudySession> sessions = studySessionRepository.findSessions(userId, studyMode, fromDate, toDate, pageable);

        return sessions.map(StudySessionMapper::mapToResponse);
    }

    @Override
    @Transactional
    public void answerFlashcard(Long userId, StudySessionAnswerRequest request) {
        StudySession session = studySessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên session này");
        }

        Flashcard flashcard = flashcardRepository.findById(request.getFlashcardId())
                .orElseThrow(() -> new RuntimeException("Flashcard not found"));

        StudySessionDetail detail = StudySessionDetail.builder()
                .session(session)
                .flashcard(flashcard)
                .isCorrect(request.getIsCorrect())
                .userAnswer(request.getUserAnswer())
                .answeredAt(LocalDateTime.now())
                .build();

        studySessionDetailRepository.save(detail);
    }

    @Override
    @Transactional
    public StudySessionEndResponse endSession(Long userId, StudySessionEndRequest request) {
        StudySession session = studySessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên session này");
        }

        session.setEndedAt(LocalDateTime.now());

        List<StudySessionDetail> details = studySessionDetailRepository.findBySessionId(session.getId());

        int total = details.size();
        int correct = (int) details.stream().filter(d -> Boolean.TRUE.equals(d.getIsCorrect())).count();
        int wrong = total - correct;

        session.setTotalQuestions(total);
        session.setCorrectAnswers(correct);
        studySessionRepository.save(session);

        return StudySessionEndResponse.builder()
                .total(total)
                .correct(correct)
                .wrong(wrong)
                .build();
    }
}