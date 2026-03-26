package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "CLASSES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassEntity extends BaseEntity {

    @Column(name = "NAME")
    String name;

    @Column(name = "DESCRIPTION")
    String description;

    @ManyToMany
    @JoinTable(
            name = "CLASS_MEMBERS",
            joinColumns = @JoinColumn(name = "CLASS_ID"),
            inverseJoinColumns = @JoinColumn(name = "USER_ID")
    )
    List<User> members;

    @OneToMany(mappedBy = "classEntity")
    List<Assignment> assignments;
}
