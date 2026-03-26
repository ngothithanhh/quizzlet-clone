package org.api.quizzz.oauth2;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

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
