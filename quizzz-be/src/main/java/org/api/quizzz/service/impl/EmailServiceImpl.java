package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.service.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    @Override
    public void sendOtp(String to, String otpCode){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã OTP từ Quizzlet");
        message.setText("Mã OTP của bạn là: " + otpCode + "\nHết hạn sau 5 phút.");
        mailSender.send(message);
    }

    @Override
    public void sendResetPassword(String to, String otpCode){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset Password Quizzlet");
        message.setText("Mã OTP để reset mật khẩu của bạn là: " + otpCode + "\nHết hạn sau 5 phút.");
        mailSender.send(message);
    }
}
