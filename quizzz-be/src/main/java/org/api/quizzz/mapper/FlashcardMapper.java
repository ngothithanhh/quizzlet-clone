package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.entity.Flashcard;

public class FlashcardMapper {
    public static FlashcardResponse toResponse(Flashcard fc) {
        return FlashcardResponse.builder()
                .id(fc.getId())
                .term(fc.getTerm())
                .definition(fc.getDefinition())
                .imageUrl(fc.getImageUrl())
                .audioUrl(fc.getAudioUrl())
                .position(fc.getPosition())
                .build();
    }
}
