package org.api.quizzz.security;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.entity.User;
import org.api.quizzz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        //tim user trong database
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException("User not found: " + email));

        //tra ve UserDetails cho Spring Security
        return UserPrincipal.fromUser(user);

    }
}