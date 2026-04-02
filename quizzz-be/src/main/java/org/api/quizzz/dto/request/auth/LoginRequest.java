package org.api.quizzz.dto.request.auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;

}
