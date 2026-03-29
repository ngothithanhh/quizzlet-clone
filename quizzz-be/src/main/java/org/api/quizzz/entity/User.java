package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, length = 100)
    String username;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    String email;

    @Column(name = "password", nullable = false, length = 255)
    String password;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    String avatarUrl;

    @Column(name = "is_verified")
    Boolean isVerified = false;

    @PrePersist
    public void prePersistUser() {
        if (this.isVerified == null) {
            this.isVerified = false;
        }
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Folder> folders;

    @OneToMany(mappedBy = "user")
    List<RefreshToken> refreshTokens;

    @OneToMany(mappedBy = "user")
    List<StudySet> studySets;

    @OneToMany(mappedBy = "user")
    List<Favorite> favorites;

    @OneToMany(mappedBy = "user")
    List<ClassMember> classMembers;

    @OneToMany(mappedBy = "user")
    List<AssignmentSubmission> submissions;

    @OneToMany(mappedBy = "user")
    List<StudyProgress> studyProgresses;

    @OneToMany(mappedBy = "user")
    List<StudySession> studySessions;

    @OneToMany(mappedBy = "owner")
    List<Classroom> ownedClasses;

    @OneToMany(mappedBy = "assignedBy")
    List<Assignment> assignments;


}