package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.api.quizzz.enums.StudyStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "flashcard_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id", nullable = false)
    Flashcard flashcard;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    StudyStatus status; // NEW, LEARNING, REVIEW, MASTERED

    @Column(name = "memory_level")
    Integer memoryLevel;

    @Column(name = "interval_days")
    Integer intervalDays;

    @Column(name = "correct_count")
    Integer correctCount;

    @Column(name = "wrong_count")
    Integer wrongCount;

    @Column(name = "last_review_at")
    LocalDateTime lastReviewAt;

    @Column(name = "next_review_at")
    LocalDateTime nextReviewAt;

    @PrePersist
    public void prePersistProgress() {
        if (status == null) status = StudyStatus.NEW;
        if (memoryLevel == null) memoryLevel = 0;
        if (intervalDays == null) intervalDays = 1;
        if (correctCount == null) correctCount = 0;
        if (wrongCount == null) wrongCount = 0;
    }


}