package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.auth.ChangePasswordRequest;
import org.api.quizzz.dto.request.auth.LoginRequest;
import org.api.quizzz.dto.request.auth.RegisterRequest;
import org.api.quizzz.dto.request.auth.ResetPasswordRequest;
import org.api.quizzz.entity.User;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.security.jwt.JwtUtil;
import org.api.quizzz.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    private final UserRepository userRepository;

    @PostMapping("/register/otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email){
        authService.sendRegisterOtp(email);
        return ResponseEntity.ok("OTP đã gửi tới email: " + email);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(
                authService.verifyOtpAndRegister(
                        request.getUsername(),
                        request.getEmail(),
                        request.getPassword(),
                        request.getOtpCode()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request) {
        Map<String, String> tokens = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(
            @RequestParam String refreshToken
    ) {
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }


    @PostMapping("/forgot-password/otp")
    public ResponseEntity<String> sendResetOtp(@RequestParam String email) {
        authService.sendResetPasswordOtp(email);
        return ResponseEntity.ok("OTP reset password đã gửi");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        authService.changePassword(email, request.getOldPassword(), request.getNewPassword());

        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @GetMapping("/test-db")
    public List<User> test() {
        return userRepository.findAll();
    }

}
