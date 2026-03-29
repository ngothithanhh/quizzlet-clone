package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.api.quizzz.enums.StudyMode;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "study_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudySession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_set_id", nullable = false)
    StudySet studySet;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 20)
    StudyMode mode; // FLASHCARD, QUIZ, TEST

    @Column(name = "started_at")
    LocalDateTime startedAt;

    @Column(name = "ended_at")
    LocalDateTime endedAt;

    @Column(name = "total_questions")
    Integer totalQuestions;

    @Column(name = "correct_answers")
    Integer correctAnswers;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    List<StudySessionDetail> details;

    @PrePersist
    public void prePersistSession() {
        super.prePersist();

        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (totalQuestions == null) totalQuestions = 0;
        if (correctAnswers == null) correctAnswers = 0;
    }


}