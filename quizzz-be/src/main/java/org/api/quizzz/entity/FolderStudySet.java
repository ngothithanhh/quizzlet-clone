package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "folder_study_sets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FolderStudySet {

    @EmbeddedId
    FolderStudySetId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("folderId")
    @JoinColumn(name = "folder_id", nullable = false)
    Folder folder;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studySetId")
    @JoinColumn(name = "study_set_id", nullable = false)
    StudySet studySet;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    public void prePersistFolderStudySet() {
        if (this.addedAt == null) {
            this.addedAt = LocalDateTime.now();
        }
    }




}