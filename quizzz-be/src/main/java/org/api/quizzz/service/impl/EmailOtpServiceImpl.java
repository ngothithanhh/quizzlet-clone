package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.EmailOtp;
import org.api.quizzz.enums.OtpStatus;
import org.api.quizzz.enums.OtpType;
import org.api.quizzz.repository.EmailOtpRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.EmailOtpService;
import org.api.quizzz.service.EmailService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailOtpServiceImpl implements EmailOtpService {
    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    @Override
    public EmailOtp createAndSendOtp(String email, OtpType type){
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000); // 6 chữ số

        EmailOtp otp = EmailOtp.builder()
                .email(email)
                .otpCode(otpCode)
                .type(type)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(2))
                .build();

        emailOtpRepository.save(otp);

        // Gửi email
        emailService.sendOtp(email, otpCode);

        return otp;


    }
    @Override
    public boolean verifyOtp(String email, OtpType type, String otpCode){
        EmailOtp otp = emailOtpRepository.findTopByEmailAndTypeAndStatusOrderByCreatedAtDesc(email, type, OtpStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("OTP không tồn tại hoặc đã sử dụng"));

        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("OTP không đúng");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP đã hết hạn");
        }

        otp.setStatus(OtpStatus.USED);
        emailOtpRepository.save(otp);

        return true;

    }
}
