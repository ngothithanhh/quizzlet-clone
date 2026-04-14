package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CloneFlashcardsRequest {

    @NotNull(message = "ID của StudySet đích không được bỏ trống")
    private Long targetStudySetId;

    private Long sourceStudySetId;

    private List<Long> sourceFlashcardIds;
}
