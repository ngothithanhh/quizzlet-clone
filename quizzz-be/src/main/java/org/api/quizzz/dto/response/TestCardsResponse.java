package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TestCardsResponse {
    private List<TrueFalseCardResponse> trueOrFalse;
    private List<FlashcardResponse> written;
    private List<LearnCardResponse> multipleChoice;
}
