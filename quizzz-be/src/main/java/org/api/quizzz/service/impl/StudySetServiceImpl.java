package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.entity.StudySet;
import org.api.quizzz.entity.User;
import org.api.quizzz.repository.FlashcardRepository;
import org.api.quizzz.repository.StudySetRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.StudySetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudySetServiceImpl implements StudySetService {

    private final StudySetRepository studySetRepository;
    private final UserRepository userRepository;
    private final FlashcardRepository flashcardRepository;

    // ========== Mapper helper ==========

    private FlashcardResponse toFlashcardResponse(org.api.quizzz.entity.Flashcard fc) {
        return FlashcardResponse.builder()
                .id(fc.getId())
                .term(fc.getTerm())
                .definition(fc.getDefinition())
                .imageUrl(fc.getImageUrl())
                .audioUrl(fc.getAudioUrl())
                .position(fc.getPosition())
                .build();
    }

    private StudySetResponse toResponse(StudySet s, boolean includeFlashcards) {
        List<FlashcardResponse> flashcards = null;
        int count = 0;

        if (includeFlashcards) {
            var raw = flashcardRepository.findByStudySetIdOrderByPositionAsc(s.getId());
            flashcards = raw.stream().map(this::toFlashcardResponse).collect(Collectors.toList());
            count = raw.size();
        } else {
            count = flashcardRepository.countByStudySetId(s.getId());
        }

        return StudySetResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .isPublic(s.getIsPublic())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .createdBy(s.getUser() != null ? s.getUser().getUsername() : null)
                .flashcardCount(count)
                .flashcards(flashcards)
                .build();
    }

    // ========== Service methods ==========

    @Override
    @Transactional
    public StudySetResponse createStudySet(Long userId, StudySetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudySet studySet = StudySet.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .user(user)
                .build();

        StudySet saved = studySetRepository.save(studySet);
        return toResponse(saved, false);
    }

    @Override
    public StudySetResponse getById(Long id) {
        StudySet studySet = studySetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySet not found with ID: " + id));
        return toResponse(studySet, true); // include flashcards for detail view
    }

    @Override
    public List<StudySetResponse> getMyStudySets(Long userId) {
        // Lấy toàn bộ StudySet của user hiện tại (cả public lẫn private)
        List<StudySet> studySets = studySetRepository.findByUserId(userId);
        return studySets.stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    @Override
    public List<StudySetResponse> getAll(String keyword) {
        List<StudySet> studySets;

        if (keyword != null && !keyword.isBlank()) {
            // Tìm kiếm public theo keyword
            studySets = studySetRepository.findByTitleContainingIgnoreCaseAndIsPublicTrue(keyword.trim());
        } else {
            // Lấy toàn bộ StudySet public của hệ thống
            studySets = studySetRepository.findByIsPublicTrue();
        }

        return studySets.stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudySetResponse updateStudySet(Long id, StudySetRequest request) {
        StudySet studySet = studySetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySet not found with ID: " + id));

        studySet.setTitle(request.getTitle());
        studySet.setDescription(request.getDescription());
        if (request.getIsPublic() != null) {
            studySet.setIsPublic(request.getIsPublic());
        }

        return toResponse(studySetRepository.save(studySet), false);
    }

    @Override
    @Transactional
    public void deleteStudySet(Long id) {
        StudySet studySet = studySetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySet not found with ID: " + id));
        studySetRepository.delete(studySet);
    }
}
