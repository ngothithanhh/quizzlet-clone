package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LearnCardResponse {
    private Long id;
    private String term;
    private String definition;
    private Integer position;
    private Long studySetId;
    private List<String> answers;
}
