package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "classes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Classroom extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    String name;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    User owner;

    @PrePersist
    public void prePersistClassroom() {
        super.prePersist();
    }

    @JsonIgnore
    @ManyToMany(mappedBy = "classrooms")
    Set<StudySet> studySets;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ClassMember> members;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Assignment> assignments;


}