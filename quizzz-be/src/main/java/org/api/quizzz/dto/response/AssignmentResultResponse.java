package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentResultResponse {
    private Long assignmentId;
    private String title;
    private String status;
    private Integer score;
    private LocalDateTime completedAt;
}
