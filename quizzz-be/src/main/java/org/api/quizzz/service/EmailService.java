package org.api.quizzz.service;

public interface EmailService {
    void sendOtp(String to, String otpCode);
    void sendResetPassword(String to, String otpCode);
}
