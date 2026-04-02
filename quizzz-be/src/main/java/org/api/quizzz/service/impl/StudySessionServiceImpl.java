package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.response.StudySessionResponse;
import org.api.quizzz.entity.StudySession;
import org.api.quizzz.enums.StudyMode;
import org.api.quizzz.mapper.StudySessionMapper;
import org.api.quizzz.repository.StudySessionRepository;
import org.api.quizzz.service.StudySessionService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StudySessionServiceImpl implements StudySessionService {
    private final StudySessionRepository studySessionRepository;
    private final StudySessionMapper studySessionMapper;
    @Override
    public Page<StudySessionResponse> getMySessions(
            int page,
            int size,
            String mode,
            String from,
            String to
    ){
        Long userId = SecurityUtils.getCurrentUserId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC,"startedAt"));

        StudyMode studyMode = (mode != null) ? StudyMode.valueOf(mode) : null;

        LocalDateTime fromDate = (from != null) ? LocalDateTime.parse(from) : null;
        LocalDateTime toDate = (to != null) ? LocalDateTime.parse(to) : null;

        Page<StudySession> sessions = studySessionRepository.findSessions(userId, studyMode, fromDate, toDate, pageable);

        return sessions.map(StudySessionMapper::mapToResponse);
    }
}
