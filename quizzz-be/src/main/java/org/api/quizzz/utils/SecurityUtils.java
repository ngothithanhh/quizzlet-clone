package org.api.quizzz.utils;

import org.api.quizzz.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;


public class SecurityUtils {
    public static Long getCurrentUserId(){
        return ((UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal()).getId();
    }
}
