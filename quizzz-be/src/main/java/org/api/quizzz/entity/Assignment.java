package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Assignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_set_id", nullable = false)
    StudySet studySet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    User assignedBy;

    @Column(name = "title", length = 255)
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "due_date")
    LocalDateTime dueDate;

    /** Giới hạn thời gian làm bài (phút). null = không giới hạn */
    @Column(name = "time_limit_minutes")
    Integer timeLimitMinutes;

    /** Cho phép học sinh xem đáp án đúng/sai sau khi nộp bài. Mặc định true */
    @Column(name = "allow_review_answers")
    @Builder.Default
    Boolean allowReviewAnswers = true;

    /** Số lần nộp bài tối đa. null = không giới hạn */
    @Column(name = "max_attempts")
    Integer maxAttempts;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    List<AssignmentSubmission> submissions;

    @PrePersist
    public void prePersistAssignment() {
        super.prePersist();
        if (allowReviewAnswers == null) allowReviewAnswers = true;
    }
}