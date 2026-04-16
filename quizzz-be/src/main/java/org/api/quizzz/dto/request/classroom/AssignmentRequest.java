package org.api.quizzz.dto.request.classroom;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRequest {
    private Long studySetId;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    /** Giới hạn thời gian làm bài (phút). null = không giới hạn */
    private Integer timeLimitMinutes;
    /** Cho phép học sinh xem đáp án sau khi nộp. Mặc định true */
    private Boolean allowReviewAnswers;
    /** Số lần nộp bài tối đa. null = không giới hạn */
    private Integer maxAttempts;
}
