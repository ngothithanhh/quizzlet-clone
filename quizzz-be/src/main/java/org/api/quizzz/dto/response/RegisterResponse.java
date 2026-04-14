package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO dùng để trả về sau khi đăng ký thành công.
 * KHÔNG trả Entity User trực tiếp để tránh lộ password hash.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private Long id;
    private String username;
    private String email;
    private String message;
}
