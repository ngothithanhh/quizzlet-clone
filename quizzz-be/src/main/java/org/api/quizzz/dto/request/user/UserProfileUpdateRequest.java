package org.api.quizzz.dto.request.user;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String username;
    private String avatarUrl;

}
