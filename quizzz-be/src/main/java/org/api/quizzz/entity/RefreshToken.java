package org.api.quizzz.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshToken extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "token", nullable = false, length = 500)
    String token;

    @Column(name = "expiry_date", nullable = false)
    LocalDateTime expiryDate;

    @Column(name = "is_revoked")
    Boolean isRevoked;

    @PrePersist
    public void prePersistToken() {
        super.prePersist();

        if (this.isRevoked == null) {
            this.isRevoked = false;
        }
    }
}