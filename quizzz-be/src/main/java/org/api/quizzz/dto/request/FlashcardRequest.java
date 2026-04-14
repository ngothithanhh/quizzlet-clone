package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FlashcardRequest {
    @NotNull(message = "StudySet ID không được để trống")
    private Long studySetId;

    @NotBlank(message = "Term không được để trống")
    private String term;

    @NotBlank(message = "Definition không được để trống")
    private String definition;

    private String imageUrl;
    private String audioUrl;
    private Integer position;
}
