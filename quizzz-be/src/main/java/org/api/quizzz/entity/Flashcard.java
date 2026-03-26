package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "FLASHCARDS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Flashcard extends BaseEntity {

    @Column(name = "TERM")
    String term;

    @Column(name = "DEFINITION")
    String definition;

    @Column(name = "IMAGE_URL")
    String imageUrl;

    @Column(name = "POSITION")
    Integer position;

    @ManyToOne
    @JoinColumn(name = "STUDY_SET_ID")
    StudySet studySet;
}