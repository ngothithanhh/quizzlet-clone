package org.api.quizzz.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.api.quizzz.enums.OtpStatus;
import org.api.quizzz.enums.OtpType;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_otps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailOtp extends BaseEntity {

    @Column(name = "email", nullable = false, length = 150)
    String email;

    @Column(name = "otp_code", nullable = false, length = 10)
    String otpCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    OtpType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    OtpStatus status;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @PrePersist
    public void prePersistOtp() {
        super.prePersist();

        if (this.status == null) {
            this.status = OtpStatus.PENDING;
        }
    }
}