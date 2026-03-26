package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ASSIGNMENTS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Assignment extends BaseEntity {

    @Column(name = "TITLE")
    String title;

    @Column(name = "DESCRIPTION")
    String description;

    @Column(name = "DUE_DATE")
    LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "CLASS_ID")
    ClassEntity classEntity;

    @ManyToOne
    @JoinColumn(name = "STUDY_SET_ID")
    StudySet studySet;

    @OneToMany(mappedBy = "assignment")
    List<AssignmentSubmission> submissions;
}