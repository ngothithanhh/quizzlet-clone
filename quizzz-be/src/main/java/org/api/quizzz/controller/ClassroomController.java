package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.*;
import org.api.quizzz.enums.ClassRole;
import org.api.quizzz.service.ClassService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassService classService;

    /** 7.2 Tạo lớp */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createClass(@RequestBody ClassRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.createClass(req));
    }

    /** 7.1 Lấy thông tin lớp */
    @GetMapping("/{classId}")
    public ResponseEntity<ClassroomResponse> getClassDetail(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getClassDetail(classId));
    }

    /** 7.9 Lấy danh sách lớp học của user */
    @GetMapping("/my")
    public ResponseEntity<List<ClassroomResponse>> getMyClasses() {
        return ResponseEntity.ok(classService.getMyClasses());
    }

    /** 7.8 Lấy danh sách thành viên lớp */
    @GetMapping("/{classId}/members")
    public ResponseEntity<List<ClassMemberResponse>> getClassMembers(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getClassMembers(classId));
    }

    /** 7.4 Cập nhật lớp */
    @PutMapping("/{classId}")
    public ResponseEntity<ClassroomResponse> updateClass(@PathVariable Long classId,
                                                         @RequestBody ClassRequest req) {
        return ResponseEntity.ok(classService.updateClass(classId, req));
    }

    /** 7.3 Xóa lớp */
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long classId) {
        classService.deleteClass(classId);
        return ResponseEntity.noContent().build();
    }

    /** 7.7 Tham gia lớp bằng mã mời */
    @PostMapping("/join")
    public ResponseEntity<Map<String, String>> joinByCode(@RequestBody JoinRequest req) {
        return ResponseEntity.ok(Map.of("message", classService.joinByCode(req)));
    }

    /** 7.7 Tạo lại mã mời */
    @PostMapping("/{classId}/invite-code")
    public ResponseEntity<Map<String, String>> regenerateCode(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.regenerateCode(classId));
    }

    /** 7.6 Thêm thành viên vào lớp */
    @PostMapping("/{classId}/members")
    public ResponseEntity<Map<String, String>> addMember(@PathVariable Long classId,
                                                          @RequestBody AddMemberRequest req) {
        return ResponseEntity.ok(Map.of("message", classService.addMember(classId, req)));
    }

    /** 7.10 Xóa thành viên khỏi lớp */
    @DeleteMapping("/{classId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long classId,
                                              @PathVariable Long userId) {
        classService.removeMember(classId, userId);
        return ResponseEntity.noContent().build();
    }

    /** 7.11 User rời lớp */
    @PostMapping("/{classId}/leave")
    public ResponseEntity<Map<String, String>> leaveClass(@PathVariable Long classId) {
        return ResponseEntity.ok(Map.of("message", classService.leaveClass(classId)));
    }

    /** 7.12 Cập nhật role cho thành viên lớp */
    @PutMapping("/{classId}/members/{userId}/role")
    public ResponseEntity<ClassMemberResponse> updateMemberRole(@PathVariable Long classId,
                                                                 @PathVariable Long userId,
                                                                 @RequestParam ClassRole newRole) {
        return ResponseEntity.ok(classService.updateMemberRole(classId, userId, newRole));
    }

    /** 7.5 Tạo bài kiểm tra */
    @PostMapping("/{classId}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(@PathVariable Long classId,
                                                                @RequestBody AssignmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.createAssignment(classId, req));
    }

    /** 7.13 Lấy danh sách bài kiểm tra theo lớp */
    @GetMapping("/{classId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignments(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getAssignmentsByClass(classId));
    }

    /** Lấy thông tin chi tiết 1 assignment (học sinh dùng khi bắt đầu làm bài) */
    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(classService.getAssignmentById(assignmentId));
    }

    /** 7.14 Nộp bài kiểm tra */
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<Map<String, String>> submitAssignment(@PathVariable Long assignmentId,
                                                                 @RequestBody SubmitAssignmentRequest req) {
        return ResponseEntity.ok(Map.of("message", classService.submitAssignment(assignmentId, req)));
    }

    /** Học sinh xem tất cả lần làm bài của mình */
    @GetMapping("/assignments/{assignmentId}/my-attempts")
    public ResponseEntity<List<SubmissionResponse>> getMyAttempts(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(classService.getMyAttempts(assignmentId));
    }

    /** 7.16 Teacher xem tất cả bài nộp */
    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(classService.getSubmissions(assignmentId));
    }

    /** 7.17 Lấy danh sách Học phần (Study Sets) trong lớp */
    @GetMapping("/{classId}/studysets")
    public ResponseEntity<List<StudySetResponse>> getStudySets(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getStudySetsByClass(classId));
    }

    /** 7.18 Thêm Học phần vào lớp */
    @PostMapping("/{classId}/studysets/{studySetId}")
    public ResponseEntity<Map<String, String>> addStudySet(@PathVariable Long classId, @PathVariable Long studySetId) {
        return ResponseEntity.ok(Map.of("message", classService.addStudySet(classId, studySetId)));
    }

    /** 7.19 Xóa Học phần khỏi lớp */
    @DeleteMapping("/{classId}/studysets/{studySetId}")
    public ResponseEntity<Void> removeStudySet(@PathVariable Long classId, @PathVariable Long studySetId) {
        classService.removeStudySet(classId, studySetId);
        return ResponseEntity.noContent().build();
    }
}