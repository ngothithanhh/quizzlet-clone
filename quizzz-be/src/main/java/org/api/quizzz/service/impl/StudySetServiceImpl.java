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

        // Lưu flashcards
        if (request.getFlashcards() != null) {
            for (int i = 0; i < request.getFlashcards().size(); i++) {
                var item = request.getFlashcards().get(i);
                if (item.getTerm() == null || item.getTerm().isBlank()) continue;
                var fc = org.api.quizzz.entity.Flashcard.builder()
                        .studySet(saved)
                        .term(item.getTerm())
                        .definition(item.getDefinition() != null ? item.getDefinition() : "")
                        .imageUrl(item.getImageUrl())
                        .audioUrl(item.getAudioUrl())
                        .position(item.getPosition() != null ? item.getPosition() : i)
                        .build();
                flashcardRepository.save(fc);
            }
        }

        return toResponse(saved, true);
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
    public List<StudySetResponse> getAll(String keyword, Long currentUserId) {
        List<StudySet> publicSets;

        if (keyword != null && !keyword.isBlank()) {
            publicSets = studySetRepository.findByTitleContainingIgnoreCaseAndIsPublicTrue(keyword.trim());
        } else {
            publicSets = studySetRepository.findByIsPublicTrue();
        }

        // Merge owner's private sets so they can find their own
        java.util.LinkedHashMap<Long, StudySet> merged = new java.util.LinkedHashMap<>();
        for (StudySet s : publicSets) merged.put(s.getId(), s);

        if (currentUserId != null) {
            List<StudySet> ownSets;
            if (keyword != null && !keyword.isBlank()) {
                ownSets = studySetRepository.findByUserIdAndTitleContainingIgnoreCase(currentUserId, keyword.trim());
            } else {
                ownSets = studySetRepository.findByUserId(currentUserId);
            }
            for (StudySet s : ownSets) merged.putIfAbsent(s.getId(), s);
        }

        return merged.values().stream()
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
        studySetRepository.save(studySet);

        // Sync flashcards
        if (request.getFlashcards() != null) {
            // ID của flashcard trong request (chỉ những cái có id hợp lệ)
            java.util.Set<Long> incomingIds = request.getFlashcards().stream()
                    .map(StudySetRequest.FlashcardItem::getId)
                    .filter(fid -> fid != null)
                    .collect(java.util.stream.Collectors.toSet());

            // Xóa những flashcard không còn trong request
            List<org.api.quizzz.entity.Flashcard> existing =
                    flashcardRepository.findByStudySetIdOrderByPositionAsc(id);
            for (var fc : existing) {
                if (!incomingIds.contains(fc.getId())) {
                    flashcardRepository.delete(fc);
                }
            }

            // Upsert flashcards
            for (int i = 0; i < request.getFlashcards().size(); i++) {
                var item = request.getFlashcards().get(i);
                if (item.getTerm() == null || item.getTerm().isBlank()) continue;
                int pos = item.getPosition() != null ? item.getPosition() : i;

                if (item.getId() != null) {
                    // Update existing
                    flashcardRepository.findById(item.getId()).ifPresent(fc -> {
                        fc.setTerm(item.getTerm());
                        fc.setDefinition(item.getDefinition() != null ? item.getDefinition() : "");
                        fc.setImageUrl(item.getImageUrl());
                        fc.setAudioUrl(item.getAudioUrl());
                        fc.setPosition(pos);
                        flashcardRepository.save(fc);
                    });
                } else {
                    // Insert new
                    var fc = org.api.quizzz.entity.Flashcard.builder()
                            .studySet(studySet)
                            .term(item.getTerm())
                            .definition(item.getDefinition() != null ? item.getDefinition() : "")
                            .imageUrl(item.getImageUrl())
                            .audioUrl(item.getAudioUrl())
                            .position(pos)
                            .build();
                    flashcardRepository.save(fc);
                }
            }
        }

        return toResponse(studySet, true);
    }

    @Override
    @Transactional
    public StudySetResponse setVisibility(Long id, boolean isPublic) {
        Long currentUserId = org.api.quizzz.utils.SecurityUtils.getCurrentUserId();
        StudySet studySet = studySetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySet not found with ID: " + id));

        if (!studySet.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi chế độ hiển thị của học phần này");
        }

        studySet.setIsPublic(isPublic);
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

        // Shuffle a copy to randomize question order
        List<org.api.quizzz.entity.Flashcard> copy = new java.util.ArrayList<>(raw);
        java.util.Collections.shuffle(copy);

        int total = copy.size();

        // Distribute: MC requires ≥4 cards to generate distractors
        // If fewer than 4 cards → all written
        // Otherwise split roughly 1/3 MC, 1/3 written, 1/3 TF
        int mcCount = 0;
        int writtenCount = 0;
        // trueOrFalse gets the rest

        if (total >= 4) {
            mcCount = Math.max(1, total / 3);
            writtenCount = Math.max(1, total / 3);
        } else {
            // Too few cards for MC distractors → use written + TF only
            writtenCount = Math.max(1, total / 2);
        }

        // Ensure we don't exceed total
        mcCount = Math.min(mcCount, total);
        writtenCount = Math.min(writtenCount, total - mcCount);
        // trueOrFalse = rest

        List<org.api.quizzz.entity.Flashcard> mcCards = new java.util.ArrayList<>();
        for (int i = 0; i < mcCount && !copy.isEmpty(); i++) mcCards.add(copy.remove(0));

        List<org.api.quizzz.entity.Flashcard> writtenCards = new java.util.ArrayList<>();
        for (int i = 0; i < writtenCount && !copy.isEmpty(); i++) writtenCards.add(copy.remove(0));

        // Remaining → true/false
        List<org.api.quizzz.entity.Flashcard> tfCards = new java.util.ArrayList<>(copy);

        // Build MC questions (uses full raw pool for distractors)
        List<LearnCardResponse> multipleChoice = generateMultipleChoiceCards(mcCards, raw);

        // Build Written questions
        List<FlashcardResponse> written = writtenCards.stream()
                .map(this::toFlashcardResponse)
                .collect(Collectors.toList());

        // Build True/False questions
        List<TrueFalseCardResponse> trueOrFalse = new java.util.ArrayList<>();
        java.util.Random rand = new java.util.Random();
        for (var card : tfCards) {
            List<String> otherDefs = raw.stream()
                .filter(c -> !c.getId().equals(card.getId()))
                .map(org.api.quizzz.entity.Flashcard::getDefinition)
                .collect(Collectors.toList());
            // Pick a random answer: 50% chance correct, 50% wrong (if available)
            String answer;
            if (!otherDefs.isEmpty() && rand.nextBoolean()) {
                answer = otherDefs.get(rand.nextInt(otherDefs.size())); // wrong answer
            } else {
                answer = card.getDefinition(); // correct answer
            }
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
