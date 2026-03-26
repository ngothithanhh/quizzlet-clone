package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "STUDY_SETS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudySet extends BaseEntity {

    @Column(name = "TITLE")
    String title;

    @Column(name = "DESCRIPTION")
    String description;

    @Column(name = "IS_PUBLIC")
    Boolean isPublic;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    User user;

    @OneToMany(mappedBy = "studySet", cascade = CascadeType.ALL)
    List<Flashcard> flashcards;

    @ManyToMany
    @JoinTable(
            name = "FOLDER_STUDY_SETS",
            joinColumns = @JoinColumn(name = "STUDY_SET_ID"),
            inverseJoinColumns = @JoinColumn(name = "FOLDER_ID")
    )
    List<Folder> folders;
}
