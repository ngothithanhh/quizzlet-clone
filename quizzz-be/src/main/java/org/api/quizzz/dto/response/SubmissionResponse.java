package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin bài nộp. Không expose trực tiếp entity AssignmentSubmission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long userId;
    private String username;
    private String status;
    private Integer score;
    private LocalDateTime completedAt;
}
