package org.api.quizzz.service;

import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.AssignmentResultResponse;
import org.api.quizzz.entity.Assignment;
import org.api.quizzz.entity.AssignmentSubmission;
import org.api.quizzz.entity.ClassMember;
import org.api.quizzz.entity.Classroom;
import org.api.quizzz.enums.ClassRole;

import java.util.List;
import java.util.Map;

public interface ClassService {

    Map<String, Object> createClass(ClassRequest req);

    Classroom getClassDetail(Long classId);

    List<ClassMember> getMyClasses();

    List<ClassMember> getClassMembers(Long classId);


    Classroom updateClass(Long classId, ClassRequest req);

    void deleteClass(Long classId);

    String joinByCode(JoinRequest req);

    Map<String, String> regenerateCode(Long classId);

    String addMember(Long classId, AddMemberRequest req);

    void removeMember(Long classId, Long targetUserId);

    String leaveClass(Long classId);

    ClassMember updateMemberRole(Long classId, Long targetUserId, ClassRole newRole);

    Assignment createAssignment(Long classId, AssignmentRequest req);

    List<Assignment> getAssignmentsByClass(Long classId);

    String submitAssignment(Long assignmentId, SubmitAssignmentRequest req);

    AssignmentResultResponse getMyResult(Long assignmentId);

    List<AssignmentSubmission> getSubmissions(Long assignmentId);

}
