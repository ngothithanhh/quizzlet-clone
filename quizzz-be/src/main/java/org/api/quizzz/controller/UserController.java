package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.user.UserProfileUpdateRequest;
import org.api.quizzz.dto.response.StudySessionResponse;
import org.api.quizzz.dto.response.UserProfileResponse;
import org.api.quizzz.service.StudySessionService;
import org.api.quizzz.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final StudySessionService studySessionService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile() {
        return userService.getMyProfile();
    }

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(@RequestBody UserProfileUpdateRequest request){
        return userService.updateMyProfile(request);
    }

    @GetMapping("/me/sessions")
    public Page<StudySessionResponse> getMySessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ){
        return studySessionService.getMySessions(page, size, mode, from, to);
    }


}
