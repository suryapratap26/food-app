package com.kspk.Utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationUtil {
    public Authentication authentication(){
        return  SecurityContextHolder.getContext().getAuthentication();
    }
}
