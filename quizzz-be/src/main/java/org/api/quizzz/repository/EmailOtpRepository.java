package org.api.quizzz.repository;

import org.api.quizzz.entity.EmailOtp;
import org.api.quizzz.enums.OtpStatus;
import org.api.quizzz.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailAndTypeOrderByCreatedAtDesc(String email, OtpType type);


    Optional<EmailOtp> findTopByEmailAndTypeAndStatusOrderByCreatedAtDesc(
            String email,
            OtpType type,
            OtpStatus status
    );
}
