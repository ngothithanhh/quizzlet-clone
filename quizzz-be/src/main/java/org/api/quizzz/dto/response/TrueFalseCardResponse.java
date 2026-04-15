package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrueFalseCardResponse {
    private Long id;
    private String term;
    private String definition;
    private String answer;
}
