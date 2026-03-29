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
public class ClassMemberId implements Serializable {

    @Column(name = "class_id")
    Long classId;

    @Column(name = "user_id")
    Long userId;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof ClassMemberId that)) return false;
        return Objects.equals(classId, that.classId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(classId, userId);
    }
}