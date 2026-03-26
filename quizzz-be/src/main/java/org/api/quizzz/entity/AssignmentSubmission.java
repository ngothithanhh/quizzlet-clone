package org.api.quizzz.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ASSIGNMENT_SUBMISSIONS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssignmentSubmission extends BaseEntity {

    @Column(name = "SCORE")
    Double score;

    @Column(name = "STATUS")
    String status;

    @ManyToOne
    @JoinColumn(name = "ASSIGNMENT_ID")
    Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    User user;
}