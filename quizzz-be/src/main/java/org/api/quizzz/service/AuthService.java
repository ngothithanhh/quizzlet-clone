package org.api.quizzz.service;

import org.api.quizzz.dto.response.LoginResponse;
import org.api.quizzz.entity.RefreshToken;
import org.api.quizzz.entity.User;

import java.util.Map;

public interface AuthService {
    void sendRegisterOtp(String email);
    User verifyOtpAndRegister(String username, String email, String password, String otpCode);
    Map<String, String> login(String email, String password);
    LoginResponse loginWithProfile(String email, String password);
    RefreshToken createRefreshToken(User user);
    String refreshAccessToken(String refreshToken);
    void logout(String refreshToken);
    void sendResetPasswordOtp(String email);
    void resetPassword(String email, String otpCode, String newPassword);
    void changePassword(String email, String oldPassword, String newPassword);
}
