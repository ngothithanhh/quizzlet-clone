package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Favorite {

    @EmbeddedId
    FavoriteId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    User user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studySetId")
    @JoinColumn(name = "study_set_id")
    StudySet studySet;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersistFolderStudySet() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }


}