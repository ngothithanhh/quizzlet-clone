package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.api.quizzz.enums.QuestionType;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "study_session_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudySessionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    StudySession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id", nullable = false)
    Flashcard flashcard;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", length = 20)
    QuestionType questionType;

    @Column(name = "question", columnDefinition = "TEXT")
    String question;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    String correctAnswer;

    @Column(name = "user_answer", columnDefinition = "TEXT")
    String userAnswer;

    @Column(name = "is_correct")
    Boolean isCorrect;

    @Column(name = "answered_at")
    LocalDateTime answeredAt;

    @OneToMany(mappedBy = "sessionDetail", cascade = CascadeType.ALL, orphanRemoval = true)
    List<QuestionOption> options;

}