package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.EmailOtp;
import org.api.quizzz.entity.RefreshToken;
import org.api.quizzz.entity.User;
import org.api.quizzz.enums.OtpStatus;
import org.api.quizzz.enums.OtpType;
import org.api.quizzz.repository.EmailOtpRepository;
import org.api.quizzz.repository.RefreshTokenRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.security.jwt.JwtUtil;
import org.api.quizzz.service.AuthService;
import org.api.quizzz.service.EmailOtpService;
import org.api.quizzz.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    @Override
    public void sendRegisterOtp(String email){
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        emailOtpService.createAndSendOtp(email,OtpType.REGISTER);
    }

    @Override
    public User verifyOtpAndRegister(String username, String email, String password, String otpCode){
        emailOtpService.verifyOtp(email,OtpType.REGISTER,otpCode);

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .isVerified(true)
                .build();
        System.out.println("SAVE USER");
        return userRepository.save(user);
    }

    @Override
    public Map<String, String> login(String email, String password){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = createRefreshToken(user);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken.getToken());
        return tokens;
    }

    @Override
    public RefreshToken createRefreshToken(User user){
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusDays(7))
                .isRevoked(false)
                .build();

        return refreshTokenRepository.save(token);

    }

    @Override
    public String refreshAccessToken(String refreshTokenStr){
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now()) || refreshToken.getIsRevoked()) {
            throw new RuntimeException("Refresh token hết hạn hoặc bị thu hồi");
        }

        return jwtUtil.generateToken(refreshToken.getUser().getEmail());
    }
    @Override
    public void sendResetPasswordOtp(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("Email không tồn tại"));

        emailOtpService.createAndSendOtp(email,OtpType.FORGOT_PASSWORD);
    }

    @Override
    public void resetPassword(String email, String otpCode, String newPassword){
        emailOtpService.verifyOtp(email,OtpType.FORGOT_PASSWORD,otpCode);

        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("User không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void changePassword(String email, String oldPassword, String newPassword){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("User không tồn tại"));

        if(!passwordEncoder.matches(oldPassword, user.getPassword())){
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
