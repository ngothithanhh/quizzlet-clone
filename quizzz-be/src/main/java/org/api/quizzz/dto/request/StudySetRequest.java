package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class StudySetRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    private Boolean isPublic;
    private List<FlashcardItem> flashcards;

    @Data
    public static class FlashcardItem {
        /** id != null → update existing; id == null → create new */
        private Long id;
        private String term;
        private String definition;
        private String imageUrl;
        private String audioUrl;
        private Integer position;
    }
}
