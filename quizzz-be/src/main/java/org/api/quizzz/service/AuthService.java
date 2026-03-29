package org.api.quizzz.service;

import org.api.quizzz.entity.RefreshToken;
import org.api.quizzz.entity.User;

import java.util.Map;

public interface AuthService {
    void sendRegisterOtp(String email);
    User verifyOtpAndRegister(String username, String email, String password, String otpCode);
    Map<String, String> login(String email, String password);
    RefreshToken createRefreshToken(User user);
    String refreshAccessToken(String refreshToken);
}
