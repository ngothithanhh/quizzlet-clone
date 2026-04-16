package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;

import org.api.quizzz.dto.request.user.UserProfileUpdateRequest;
import org.api.quizzz.dto.response.UserProfileResponse;
import org.api.quizzz.entity.User;
import org.api.quizzz.mapper.UserMapper;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.UserService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    @Override
    public UserProfileResponse getMyProfile(){
//        System.out.println(SecurityUtils.getCurrentUserId());
//        System.out.println("Service");
        Long id = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User không tồn tại"));

        return UserMapper.mapToProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateMyProfile(UserProfileUpdateRequest request){
        Long id = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User không tồn tại"));

        if(request.getUsername()!=null){
            user.setUsername(request.getUsername());
        }

        if(request.getAvatarUrl()!=null){
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);

        return userMapper.mapToProfileResponse(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User không tồn tại với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public java.util.List<UserProfileResponse> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return userRepository.findTop10ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .map(UserMapper::mapToProfileResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}
