package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.UserProfileResponse;
import org.api.quizzz.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public static UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isVerified(user.getIsVerified())
                .build();
    }
}
