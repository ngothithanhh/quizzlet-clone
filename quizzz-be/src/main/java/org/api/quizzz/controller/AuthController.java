package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.auth.ChangePasswordRequest;
import org.api.quizzz.dto.request.auth.LoginRequest;
import org.api.quizzz.dto.request.auth.RegisterRequest;
import org.api.quizzz.dto.request.auth.ResetPasswordRequest;
import org.api.quizzz.dto.response.RegisterResponse;
import org.api.quizzz.entity.User;
import org.api.quizzz.service.AuthService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Bước 1: Gửi OTP đến email để xác thực đăng ký.
     * POST /api/auth/register/otp?email=...
     */
    @PostMapping("/register/otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestParam String email) {
        authService.sendRegisterOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã gửi tới email: " + email));
    }

    /**
     * Bước 2: Xác thực OTP và hoàn tất đăng ký.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        User user = authService.verifyOtpAndRegister(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getOtpCode()
        );

        RegisterResponse response = RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .message("Đăng ký thành công")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đăng nhập bằng email + password, trả về accessToken và refreshToken.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Map<String, String> tokens = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(tokens);
    }

    /**
     * Đăng nhập và trả về thông tin user kèm tokens (recommended).
     * POST /api/auth/login/profile
     */
    @PostMapping("/login/profile")
    public ResponseEntity<org.api.quizzz.dto.response.LoginResponse> loginWithProfile(@RequestBody LoginRequest request) {
        org.api.quizzz.dto.response.LoginResponse response = authService.loginWithProfile(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    /**
     * Làm mới accessToken bằng refreshToken.
     * POST /api/auth/refresh?refreshToken=...
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@RequestParam String refreshToken) {
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    /**
     * Đăng xuất: Thu hồi refresh token.
     * POST /api/auth/logout?refreshToken=...
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    /**
     * Bước 1 quên mật khẩu: Gửi OTP về email.
     * POST /api/auth/forgot-password/otp?email=...
     */
    @PostMapping("/forgot-password/otp")
    public ResponseEntity<Map<String, String>> sendResetOtp(@RequestParam String email) {
        authService.sendResetPasswordOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP reset password đã gửi tới email: " + email));
    }

    /**
     * Bước 2 quên mật khẩu: Xác thực OTP và đặt lại mật khẩu.
     * POST /api/auth/forgot-password/reset
     */
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    /**
     * Đổi mật khẩu khi đã đăng nhập (cần cung cấp mật khẩu cũ).
     * Lấy email từ SecurityContext thay vì trực tiếp từ header.
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        authService.changePassword(email, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
