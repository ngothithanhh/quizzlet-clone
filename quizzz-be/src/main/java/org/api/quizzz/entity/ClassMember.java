package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.api.quizzz.enums.ClassRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_members")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassMember {

    @EmbeddedId
    ClassMemberId id;

    @Column(name = "joined_at")
    LocalDateTime joinedAt;

    @Column(name = "is_creator")
    boolean isCreator = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classId")
    @JoinColumn(name = "class_id", nullable = false)
    Classroom classroom;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    ClassRole role;

    @PrePersist
    public void prePersistMember() {
        if (this.role == null) {
            this.role = ClassRole.STUDENT;
        }
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
    }
}