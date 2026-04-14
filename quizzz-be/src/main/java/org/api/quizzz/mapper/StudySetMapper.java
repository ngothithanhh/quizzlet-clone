package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.entity.StudySet;

import java.util.List;

public class StudySetMapper {
    private StudySetMapper() {}

    public static StudySetResponse toResponse(StudySet s) {
        return StudySetResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .isPublic(s.getIsPublic())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .createdBy(s.getUser() != null ? s.getUser().getUsername() : null)
                .build();
    }
}
