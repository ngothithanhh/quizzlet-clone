package org.api.quizzz.utils;

import org.api.quizzz.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;


public class SecurityUtils {

    public static Long getCurrentUserId() {
        return ((UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal()).getId();
    }

    public static String getCurrentUserEmail() {
        return ((UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal()).getUsername(); // getUsername() trả về email trong UserPrincipal
    }
}
