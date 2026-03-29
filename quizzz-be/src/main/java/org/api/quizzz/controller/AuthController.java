package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.User;
import org.api.quizzz.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register/otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email){
        authService.sendRegisterOtp(email);
        return ResponseEntity.ok("OTP đã gửi tới email: " + email);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String otpCode
    ){
        User user = authService.verifyOtpAndRegister(username,email,password,otpCode);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestParam String email,
            @RequestParam String password
    ) {
        Map<String, String> tokens = authService.login(email, password);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(
            @RequestParam String refreshToken
    ) {
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

}
