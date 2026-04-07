package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin bài kiểm tra. Không expose trực tiếp entity Assignment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private Long studySetId;
    private String studySetTitle;
    private Long classId;
    private String className;
    private Long assignedById;
    private String assignedByUsername;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
}
