package org.api.quizzz.service;

import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.*;
import org.api.quizzz.enums.ClassRole;

import java.util.List;
import java.util.Map;

public interface ClassService {

    Map<String, Object> createClass(ClassRequest req);

    ClassroomResponse getClassDetail(Long classId);

    List<ClassMemberResponse> getMyClasses();

    List<ClassMemberResponse> getClassMembers(Long classId);

    ClassroomResponse updateClass(Long classId, ClassRequest req);

    void deleteClass(Long classId);

    String joinByCode(JoinRequest req);

    Map<String, String> regenerateCode(Long classId);

    String addMember(Long classId, AddMemberRequest req);

    void removeMember(Long classId, Long targetUserId);

    String leaveClass(Long classId);

    ClassMemberResponse updateMemberRole(Long classId, Long targetUserId, ClassRole newRole);

    AssignmentResponse createAssignment(Long classId, AssignmentRequest req);

    List<AssignmentResponse> getAssignmentsByClass(Long classId);

    String submitAssignment(Long assignmentId, SubmitAssignmentRequest req);

    AssignmentResultResponse getMyResult(Long assignmentId);

    List<SubmissionResponse> getSubmissions(Long assignmentId);
}
