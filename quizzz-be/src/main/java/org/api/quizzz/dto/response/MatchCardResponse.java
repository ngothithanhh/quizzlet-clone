package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MatchCardResponse {
    private Long flashcardId;
    private String content;
}
