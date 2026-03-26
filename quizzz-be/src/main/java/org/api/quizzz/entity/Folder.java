package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "FOLDERS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Folder extends BaseEntity {

    @Column(name = "NAME")
    String name;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    User user;

    @ManyToMany(mappedBy = "folders")
    List<StudySet> studySets;
}