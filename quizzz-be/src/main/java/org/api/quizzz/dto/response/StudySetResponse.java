package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO chi tiết StudySet, gồm cả danh sách flashcard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySetResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean isPublic;
    private Long userId;
    private String createdBy; // username của người tạo
    private int flashcardCount;
    private List<FlashcardResponse> flashcards;
}
