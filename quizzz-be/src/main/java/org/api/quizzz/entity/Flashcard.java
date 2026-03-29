package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "flashcards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Flashcard extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_set_id", nullable = false)
    StudySet studySet;

    @Column(name = "term", nullable = false, columnDefinition = "TEXT")
    String term;

    @Column(name = "definition", nullable = false, columnDefinition = "TEXT")
    String definition;

    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    String audioUrl;

    @Column(name = "position")
    Integer position;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersistFlashcard() {
        super.prePersist();
    }

    @PreUpdate
    public void preUpdateFlashcard() {
        this.updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "flashcard")
    List<StudyProgress> studyProgresses;

    @OneToMany(mappedBy = "flashcard")
    List<StudySessionDetail> sessionDetails;


}