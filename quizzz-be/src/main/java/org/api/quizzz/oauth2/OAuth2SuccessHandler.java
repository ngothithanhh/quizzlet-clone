package org.api.quizzz.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.RefreshToken;
import org.api.quizzz.entity.User;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.AuthService;
import org.api.quizzz.security.jwt.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        //Check user tồn tại chưa
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .username(name)
                    .password("") // không dùng password
                    .isVerified(true)
                    .build();
            return userRepository.save(newUser);
        });

        // Tạo token
        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = authService.createRefreshToken(user);

        // Redirect về NextJS
        // Chú ý: Ở môi trường thật, nên lấy domain frontend từ properties (application.yaml).
        // Tạm thời hardcode localhost:3001 vì NextJS đang chạy trên port 3001 thay vì 3000
        String frontendUrl = "http://localhost:3001"; 
        
        String targetUrl = String.format("%s/api/auth/oauth-callback?accessToken=%s&refreshToken=%s", 
                frontendUrl, accessToken, refreshToken.getToken());

        response.sendRedirect(targetUrl);
    }
}