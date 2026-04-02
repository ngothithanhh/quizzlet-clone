package org.api.quizzz.dto.request.auth;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String otpCode;
    private String newPassword;
}
