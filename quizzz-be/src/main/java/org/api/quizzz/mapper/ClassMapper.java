package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.*;
import org.api.quizzz.entity.*;

public class ClassMapper {

    public static ClassroomResponse toClassroomResponse(Classroom c, Long currentUserId) {
        Boolean isCreator = false;
        String currentUserRole = null;

        if (c.getMembers() != null && currentUserId != null) {
            for (ClassMember m : c.getMembers()) {
                if (currentUserId.equals(m.getUser().getId())) {
                    isCreator = m.isCreator();
                    currentUserRole = m.getRole() != null ? m.getRole().name() : null;
                    break;
                }
            }
        }

        return ClassroomResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .inviteCode(c.getInviteCode())
                .ownerId(c.getOwner().getId())
                .ownerUsername(c.getOwner().getUsername())
                .createdAt(c.getCreatedAt())
                .memberCount(c.getMembers() != null ? c.getMembers().size() : 0)
                .isCreator(isCreator)
                .currentUserRole(currentUserRole)
                .build();
    }

    public static ClassMemberResponse toMemberResponse(ClassMember cm) {
        User u = cm.getUser();
        return ClassMemberResponse.builder()
                .userId(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .avatarUrl(u.getAvatarUrl())
                .role(cm.getRole())
                .isCreator(cm.isCreator())
                .build();
    }

    public static AssignmentResponse toAssignmentResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .studySetId(a.getStudySet() != null ? a.getStudySet().getId() : null)
                .studySetTitle(a.getStudySet() != null ? a.getStudySet().getTitle() : null)
                .classId(a.getClassroom() != null ? a.getClassroom().getId() : null)
                .className(a.getClassroom() != null ? a.getClassroom().getName() : null)
                .assignedById(a.getAssignedBy() != null ? a.getAssignedBy().getId() : null)
                .assignedByUsername(a.getAssignedBy() != null ? a.getAssignedBy().getUsername() : null)
                .dueDate(a.getDueDate())
                .createdAt(a.getCreatedAt())
                .build();
    }

    public static SubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment() != null ? s.getAssignment().getId() : null)
                .assignmentTitle(s.getAssignment() != null ? s.getAssignment().getTitle() : null)
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .username(s.getUser() != null ? s.getUser().getUsername() : null)
                .status(s.getStatus())
                .score(s.getScore())
                .completedAt(s.getCompletedAt())
                .build();
    }
}