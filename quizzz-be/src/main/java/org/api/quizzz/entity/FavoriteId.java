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
public class FavoriteId implements Serializable {

    @Column(name = "user_id")
    Long userId;

    @Column(name = "study_set_id")
    Long studySetId;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof FavoriteId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(studySetId, that.studySetId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, studySetId);
    }
}