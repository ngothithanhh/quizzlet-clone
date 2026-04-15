package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về sau khi đăng nhập thành công.
 * Bao gồm cả thông tin user và tokens.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private String email;
    private String avatarUrl;
    private Boolean isVerified;
    private String accessToken;
    private String refreshToken;
}

