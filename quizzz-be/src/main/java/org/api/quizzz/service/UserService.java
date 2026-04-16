package org.api.quizzz.service;

import org.api.quizzz.dto.request.user.UserProfileUpdateRequest;
import org.api.quizzz.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getMyProfile();
    UserProfileResponse updateMyProfile(UserProfileUpdateRequest request);
    void deleteUser(Long id);
    java.util.List<UserProfileResponse> searchUsers(String query);
}
