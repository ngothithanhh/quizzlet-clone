package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "study_sets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudySet extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "is_public")
    Boolean isPublic;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @PrePersist
    public void prePersistStudySet() {
        super.prePersist();

        if (this.isPublic == null) {
            this.isPublic = true;
        }
    }

    @OneToMany(mappedBy = "studySet", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Flashcard> flashcards;

    @ManyToMany
    @JoinTable(
            name = "study_set_classes",
            joinColumns = @JoinColumn(name = "study_set_id"),
            inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    Set<Classroom> classrooms;

    @OneToMany(mappedBy = "studySet")
    List<Favorite> favorites;

    @OneToMany(mappedBy = "studySet")
    List<FolderStudySet> folderStudySets;

    @OneToMany(mappedBy = "studySet")
    List<Assignment> assignments;

    @OneToMany(mappedBy = "studySet")
    List<StudySession> studySessions;



}