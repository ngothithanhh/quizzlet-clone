package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "STUDY_PROGRESS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudyProgress extends BaseEntity {

    @Column(name = "MASTERED_COUNT")
    Integer masteredCount;

    @Column(name = "LEARNING_COUNT")
    Integer learningCount;

    @Column(name = "REVIEW_COUNT")
    Integer reviewCount;

    @Column(name = "PROGRESS_PERCENT")
    Double progressPercent;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    User user;

    @ManyToOne
    @JoinColumn(name = "STUDY_SET_ID")
    StudySet studySet;
}
