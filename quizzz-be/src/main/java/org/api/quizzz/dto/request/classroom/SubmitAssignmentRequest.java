package org.api.quizzz.dto.request.classroom;

import lombok.Data;

@Data
public class SubmitAssignmentRequest {
    private Long assignmentId;
    private Integer score;

}
