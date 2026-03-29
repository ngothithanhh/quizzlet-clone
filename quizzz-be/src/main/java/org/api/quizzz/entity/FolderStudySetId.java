package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FolderStudySetId implements Serializable {

    @Column(name = "folder_id")
    Long folderId;

    @Column(name = "study_set_id")
    Long studySetId;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof FolderStudySetId that)) return false;
        return Objects.equals(folderId, that.folderId) && Objects.equals(studySetId, that.studySetId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(folderId, studySetId);
    }
}