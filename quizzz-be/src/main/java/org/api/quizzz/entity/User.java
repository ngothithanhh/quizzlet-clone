package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseEntity {
    @Column(name = "USERNAME")
    String username;

    @Column(name = "EMAIL", unique = true)
    String email;

    @Column(name = "PASSWORD")
    String password;

    @Column(name = "AVATAR_URL")
    String avatarUrl;

    // 🔥 thêm role
    @Column(name = "ROLE")
    String role; // USER, ADMIN

    // 🔥 phân biệt login kiểu gì
    @Column(name = "PROVIDER")
    String provider; // LOCAL, GOOGLE

    @Column(name = "IS_VERIFIED")
    Boolean isVerified;

    // 1 user có nhiều study set
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    List<StudySet> studySets;

    // many-to-many với class
    @ManyToMany(mappedBy = "members", fetch = FetchType.LAZY)
    List<ClassEntity> classes;
}