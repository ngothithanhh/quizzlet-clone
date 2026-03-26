package org.api.quizzz.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.User;
import org.api.quizzz.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

//    private final UserRepository userRepository;
//    private final JwtService jwtService;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException {
//
//        OAuth2User user = (OAuth2User) authentication.getPrincipal();
//
//        String email = user.getAttribute("email");
//
//        User u = userRepository.findByEmail(email)
//                .orElseGet(() -> {
//                    User newUser = new User();
//                    newUser.setEmail(email);
//                    newUser.setUsername(email);
//                    newUser.setRole("USER");
//                    return userRepository.save(newUser);
//                });
//
//        String token = jwtService.generateToken(u.getUsername());
//
//        response.sendRedirect("http://localhost:4200?token=" + token);
//    }
}
