package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "question_options")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_detail_id", nullable = false)
    StudySessionDetail sessionDetail;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    String optionText;

    @Column(name = "is_correct")
    Boolean isCorrect;

    @PrePersist
    public void prePersistOption() {
        if (isCorrect == null) {
            isCorrect = false;
        }
    }

}