package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.AssignmentResultResponse;
import org.api.quizzz.entity.Assignment;
import org.api.quizzz.entity.AssignmentSubmission;
import org.api.quizzz.entity.ClassMember;
import org.api.quizzz.entity.Classroom;
import org.api.quizzz.enums.ClassRole;
import org.api.quizzz.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassService classService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createClass(@RequestBody ClassRequest req) {
        return ResponseEntity.ok(classService.createClass(req));
    }

    @GetMapping("/{classId}")
    public ResponseEntity<Classroom> getClassDetail(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getClassDetail(classId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClassMember>> getMyClasses() {
        return ResponseEntity.ok(classService.getMyClasses());
    }

    @GetMapping("/{classId}/members")
    public ResponseEntity<List<ClassMember>> getClassMembers(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getClassMembers(classId));
    }


    @PutMapping("/{classId}")
    public ResponseEntity<Classroom> updateClass(@PathVariable Long classId,
                                                 @RequestBody ClassRequest req) {
        return ResponseEntity.ok(classService.updateClass(classId, req));
    }


    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long classId) {
        classService.deleteClass(classId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/join")
    public ResponseEntity<String> joinByCode(@RequestBody JoinRequest req) {
        return ResponseEntity.ok(classService.joinByCode(req));
    }


    @PostMapping("/{classId}/invite-code")
    public ResponseEntity<Map<String, String>> regenerateCode(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.regenerateCode(classId));
    }

    @PostMapping("/{classId}/members")
    public ResponseEntity<String> addMember(@PathVariable Long classId,
                                            @RequestBody AddMemberRequest req) {
        return ResponseEntity.ok(classService.addMember(classId, req));
    }


    @DeleteMapping("/{classId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long classId,
                                             @PathVariable Long userId) {
        classService.removeMember(classId, userId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{classId}/leave")
    public ResponseEntity<String> leaveClass(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.leaveClass(classId));
    }


    @PutMapping("/{classId}/members/{userId}/role")
    public ResponseEntity<ClassMember> updateMemberRole(@PathVariable Long classId,
                                                        @PathVariable Long userId,
                                                        @RequestParam ClassRole newRole) {
        return ResponseEntity.ok(classService.updateMemberRole(classId, userId, newRole));
    }

    @PostMapping("/{classId}/assignments")
    public ResponseEntity<Assignment> createAssignment(@PathVariable Long classId,
                                                       @RequestBody AssignmentRequest req) {
        return ResponseEntity.ok(classService.createAssignment(classId, req));
    }

    @GetMapping("/{classId}/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.getAssignmentsByClass(classId));
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<String> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody SubmitAssignmentRequest req) {

        return ResponseEntity.ok(classService.submitAssignment(assignmentId, req));
    }

    @GetMapping("/assignments/{assignmentId}/my-result")
    public ResponseEntity<AssignmentResultResponse> getMyResult(
            @PathVariable Long assignmentId) {

        return ResponseEntity.ok(classService.getMyResult(assignmentId));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(
            @PathVariable Long assignmentId) {

        return ResponseEntity.ok(classService.getSubmissions(assignmentId));
    }
}