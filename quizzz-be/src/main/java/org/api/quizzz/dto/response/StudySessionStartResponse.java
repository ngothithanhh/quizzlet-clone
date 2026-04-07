package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.api.quizzz.dto.FlashcardTermDTO;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionStartResponse {
    private Long sessionId;
    private List<FlashcardTermDTO> flashcards;
}
