package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "status", length = 20)
    String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    /** Lần thứ bao nhiêu học sinh nộp bài */
    @Column(name = "attempt_number")
    Integer attemptNumber;

    @Column(name = "score")
    Integer score;

    /** Số câu đúng */
    @Column(name = "correct_answers")
    Integer correctAnswers;

    /** Tổng số câu hỏi */
    @Column(name = "total_questions")
    Integer totalQuestions;

    /** Thời gian hoàn thành tính bằng giây */
    @Column(name = "duration_seconds")
    Integer durationSeconds;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    /**
     * JSON: [{flashcardId, term, userAnswer, correctAnswer, isCorrect}]
     * Lưu chi tiết từng câu trả lời của học sinh
     */
    @Column(name = "answers_json", columnDefinition = "TEXT")
    String answersJson;

    @PrePersist
    public void prePersistSubmission() {
        if (status == null) status = "NOT_STARTED";
    }
}