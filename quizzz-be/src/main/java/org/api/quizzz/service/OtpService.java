package org.api.quizzz.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.api.quizzz.entity.Otp;
import org.api.quizzz.repository.OtpRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpService {
//    JavaMailSender mailSender;
//    OtpRepository otpRepository;
//
//
//    public void sendOtp(String email) {
//
//        String code = String.valueOf(new Random().nextInt(999999));
//
//        Otp otp = new Otp();
//        otp.setEmail(email);
//        otp.setCode(code);
//        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
//
//        otpRepository.save(otp);
//
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(email);
//        message.setSubject("Your OTP Code");
//        message.setText("OTP: " + code);
//
//        mailSender.send(message);
//    }

//    public void verifyOtp(String email, String code) {
//
//        Otp otp = otpRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("OTP not found"));
//
//        if (!otp.getCode().equals(code)) {
//            throw new RuntimeException("Invalid OTP");
//        }
//
//        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
//            throw new RuntimeException("OTP expired");
//        }
//    }
}
