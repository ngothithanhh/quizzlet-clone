package org.api.quizzz.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    Long id;
    String username;
    String email;
    String avatarUrl;
    boolean isVerified;
}
