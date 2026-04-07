package org.api.quizzz.dto.request.classroom;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRequest {
    private Long studySetId;
    private String title;
    private String description;
    private LocalDateTime dueDate;
}
