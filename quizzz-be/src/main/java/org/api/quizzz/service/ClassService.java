package org.api.quizzz.service;

import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.*;
import org.api.quizzz.enums.ClassRole;

import java.util.List;
import java.util.Map;

public interface ClassService {

    Map<String, Object> createClass(ClassRequest req);

    ClassroomResponse getClassDetail(Long classId);

    List<ClassroomResponse> getMyClasses();

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

    AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest req);

    List<AssignmentResponse> getAssignmentsByClass(Long classId);

    AssignmentResponse getAssignmentById(Long assignmentId);

    String submitAssignment(Long assignmentId, SubmitAssignmentRequest req);

    /** Lấy tất cả lần làm bài của user hiện tại cho một assignment */
    List<SubmissionResponse> getMyAttempts(Long assignmentId);

    /** Teacher xem tất cả submissions của cả lớp */
    List<SubmissionResponse> getSubmissions(Long assignmentId);

    List<StudySetResponse> getStudySetsByClass(Long classId);
    String addStudySet(Long classId, Long studySetId);
    void removeStudySet(Long classId, Long studySetId);
}
