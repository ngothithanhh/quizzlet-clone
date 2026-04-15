package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.*;
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

    @Override
    public List<MatchCardResponse> getMatchCards(Long id) {
        var raw = flashcardRepository.findByStudySetIdOrderByPositionAsc(id);
        List<org.api.quizzz.entity.Flashcard> subset = raw.stream().limit(4).collect(Collectors.toList());
        
        List<MatchCardResponse> result = new java.util.ArrayList<>();
        for (var fc : subset) {
            result.add(MatchCardResponse.builder().flashcardId(fc.getId()).content(fc.getTerm()).build());
            result.add(MatchCardResponse.builder().flashcardId(fc.getId()).content(fc.getDefinition()).build());
        }
        
        java.util.Collections.shuffle(result);
        return result;
    }

    private List<LearnCardResponse> generateMultipleChoiceCards(List<org.api.quizzz.entity.Flashcard> subset, List<org.api.quizzz.entity.Flashcard> pool) {
        List<LearnCardResponse> result = new java.util.ArrayList<>();
        for (var card : subset) {
            List<String> falseAnswers = pool.stream()
                .filter(c -> !c.getId().equals(card.getId()))
                .map(org.api.quizzz.entity.Flashcard::getDefinition)
                .collect(Collectors.toList());
            java.util.Collections.shuffle(falseAnswers);
            List<String> answers = new java.util.ArrayList<>(falseAnswers.subList(0, Math.min(3, falseAnswers.size())));
            answers.add(card.getDefinition());
            java.util.Collections.shuffle(answers);
            
            result.add(LearnCardResponse.builder()
                .id(card.getId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .position(card.getPosition())
                .studySetId(card.getStudySet().getId())
                .answers(answers)
                .build());
        }
        return result;
    }

    @Override
    public List<LearnCardResponse> getLearnCards(Long id) {
        var raw = flashcardRepository.findByStudySetIdOrderByPositionAsc(id);
        return generateMultipleChoiceCards(raw, raw);
    }

    @Override
    public TestCardsResponse getTestCards(Long id) {
        var raw = flashcardRepository.findByStudySetIdOrderByPositionAsc(id);
        if (raw.isEmpty()) {
            return TestCardsResponse.builder()
                .trueOrFalse(List.of())
                .written(List.of())
                .multipleChoice(List.of())
                .build();
        }

        List<org.api.quizzz.entity.Flashcard> copy = new java.util.ArrayList<>(raw);
        java.util.Collections.shuffle(copy);

        int tenPercent = (int) (0.1 * raw.size());
        int count = Math.max(tenPercent, 1);
        
        List<org.api.quizzz.entity.Flashcard> mcInitial = new java.util.ArrayList<>();
        for (int i=0; i<count && !copy.isEmpty(); i++) mcInitial.add(copy.remove(0));
        
        List<LearnCardResponse> multipleChoice = generateMultipleChoiceCards(mcInitial, raw);
        
        List<FlashcardResponse> written = new java.util.ArrayList<>();
        for (int i=0; i<count && !copy.isEmpty(); i++) written.add(toFlashcardResponse(copy.remove(0)));
        
        List<TrueFalseCardResponse> trueOrFalse = new java.util.ArrayList<>();
        java.util.Random rand = new java.util.Random();
        for (var card : copy) {
            List<String> falseAnswers = raw.stream()
                .filter(c -> !c.getId().equals(card.getId()))
                .map(org.api.quizzz.entity.Flashcard::getDefinition)
                .collect(Collectors.toList());
            String falseAnswer = falseAnswers.isEmpty() ? card.getDefinition() : falseAnswers.get(rand.nextInt(falseAnswers.size()));
            String answer = rand.nextBoolean() ? falseAnswer : card.getDefinition();
            
            trueOrFalse.add(TrueFalseCardResponse.builder()
                .id(card.getId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .answer(answer)
                .build());
        }
        
        return TestCardsResponse.builder()
            .multipleChoice(multipleChoice)
            .written(written)
            .trueOrFalse(trueOrFalse)
            .build();
    }
}
