package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.entity.StudySet;

import java.util.List;
import java.util.stream.Collectors;

public class FavoriteMapper {

    /**
     * Chuyển đổi StudySet entity -> StudySetResponse DTO.
     * Dùng FlashcardMapper.toResponse (static) để map flashcard — không cần inject repository.
     * flashcards trong StudySet được load từ phía service trước khi gọi mapper này.
     */
    public static StudySetResponse toResponse(StudySet s) {
        List<FlashcardResponse> flashcards = s.getFlashcards() != null
                ? s.getFlashcards().stream()
                        .map(FlashcardMapper::toResponse)
                        .collect(Collectors.toList())
                : List.of();

        return StudySetResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .isPublic(s.getIsPublic())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .createdBy(s.getUser() != null ? s.getUser().getUsername() : null)
                .flashcardCount(flashcards.size())
                .flashcards(flashcards)
                .build();
    }
}
