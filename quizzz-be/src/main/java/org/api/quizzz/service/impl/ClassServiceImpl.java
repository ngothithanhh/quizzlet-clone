package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.AssignmentResultResponse;
import org.api.quizzz.entity.*;
import org.api.quizzz.enums.ClassRole;
import org.api.quizzz.repository.*;
import org.api.quizzz.service.ClassService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {
    private final ClassRepository classRepo;
    private final ClassMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final AssignmentRepository assignmentRepo;
    private final StudySetRepository studySetRepo;
    private final AssignmentSubmissionRepository submissionRepo;


    @Override
    public Map<String, Object> createClass(ClassRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        Classroom c = Classroom.builder()
                .name(req.getName())
                .description(req.getDescription())
                .inviteCode(generateCode())
                .owner(userRepo.findById(userId).orElseThrow())
                .build();
        classRepo.save(c);

        ClassMember cm = new ClassMember();
        cm.setId(new ClassMemberId(c.getId(), userId));
        cm.setClassroom(c);
        cm.setUser(c.getOwner());
        cm.setRole(ClassRole.STUDENT);
        cm.setCreator(true);
        memberRepo.save(cm);

        return Map.of(
                "classId", c.getId(),
                "inviteCode", c.getInviteCode()
        );
    }

    @Override
    public Classroom getClassDetail(Long classId) {
        return classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    @Override
    public List<ClassMember> getMyClasses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return memberRepo.findByUserId(userId);
    }

    @Override
    public List<ClassMember> getClassMembers(Long classId) {
        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        return memberRepo.findByClassroomIdAndRole(classId, null);
    }

    @Override
    public Classroom updateClass(Long classId, ClassRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        Classroom c = classRepo.findById(classId).orElseThrow();
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        return classRepo.save(c);
    }

    @Override
    public void deleteClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");
        classRepo.deleteById(classId);
    }

    @Override
    public String joinByCode(JoinRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        Classroom c = classRepo.findByInviteCode(req.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Invalid code"));

        ClassMemberId id = new ClassMemberId(c.getId(), userId);
        if (memberRepo.existsById(id)) throw new RuntimeException("Already joined");

        ClassMember cm = new ClassMember();
        cm.setId(id);
        cm.setClassroom(c);
        cm.setUser(userRepo.findById(userId).orElseThrow());
        cm.setRole(ClassRole.STUDENT);
        cm.setCreator(false);
        memberRepo.save(cm);

        return "Joined";
    }

    @Override
    public Map<String, String> regenerateCode(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        Classroom c = classRepo.findById(classId).orElseThrow();
        c.setInviteCode(generateCode());
        return Map.of("inviteCode", classRepo.save(c).getInviteCode());
    }


    @Override
    public String addMember(Long classId, AddMemberRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        ClassMemberId id = new ClassMemberId(classId, req.getUserId());
        if (memberRepo.existsById(id)) throw new RuntimeException("Already exists");

        ClassMember cm = new ClassMember();
        cm.setId(id);
        cm.setClassroom(classRepo.getReferenceById(classId));
        cm.setUser(userRepo.getReferenceById(req.getUserId()));
        cm.setRole(req.getRole());
        cm.setCreator(false);
        memberRepo.save(cm);

        return "Added";
    }

    @Override
    public void removeMember(Long classId, Long targetUserId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId) && !userId.equals(targetUserId))
            throw new RuntimeException("Forbidden");

        memberRepo.deleteById(new ClassMemberId(classId, targetUserId));
    }

    @Override
    public String leaveClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();

        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member"));

        if (member.isCreator()) {
            throw new RuntimeException("Creator cannot leave class");
        }

        memberRepo.delete(member);
        return "Left class";
    }

    @Override
    public ClassMember updateMemberRole(Long classId, Long targetUserId, ClassRole newRole) {
        Long userId = SecurityUtils.getCurrentUserId();
        ClassMember creator = memberRepo.findByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
        if (creator == null) throw new RuntimeException("Forbidden");

        ClassMember target = memberRepo.findByClassroomIdAndUserId(classId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        target.setRole(newRole);
        return memberRepo.save(target);
    }

    @Override
    public Assignment createAssignment(Long classId, AssignmentRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of class"));

        if (member.getRole() != ClassRole.TEACHER && !member.isCreator()) {
            throw new RuntimeException("Forbidden: Only teacher or creator can create assignment");
        }

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        StudySet ss = studySetRepo.findById(req.getStudySetId())
                .orElseThrow(() -> new RuntimeException("StudySet not found"));

        Assignment assignment = Assignment.builder()
                .classroom(c)
                .studySet(ss)
                .assignedBy(userRepo.getReferenceById(userId))
                .title(req.getTitle())
                .description(req.getDescription())
                .dueDate(req.getDueDate())
                .build();

        return assignmentRepo.save(assignment);
    }

    @Override
    public List<Assignment> getAssignmentsByClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();

        memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member"));

        return assignmentRepo.findByClassroomId(classId);
    }

    @Override
    public String submitAssignment(Long assignmentId, SubmitAssignmentRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member"));

        AssignmentSubmission submission = submissionRepo
                .findByAssignmentIdAndUserId(assignmentId, userId)
                .orElse(null);

        if (submission == null) {
            submission = new AssignmentSubmission();
            submission.setAssignment(assignment);
            submission.setUser(userRepo.getReferenceById(userId));
        }

        submission.setStatus("COMPLETED");
        submission.setScore(req.getScore());
        submission.setCompletedAt(LocalDateTime.now());

        submissionRepo.save(submission);

        return "Submitted";
    }

    @Override
    public List<AssignmentSubmission> getSubmissions(Long assignmentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        ClassMember member = memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member"));

        // 🔥 chỉ teacher hoặc creator mới xem được
        if (member.getRole() != ClassRole.TEACHER && !member.isCreator()) {
            throw new RuntimeException("Forbidden");
        }

        return submissionRepo.findByAssignmentId(assignmentId);
    }

    @Override
    public AssignmentResultResponse getMyResult(Long assignmentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // check user có trong class không
        memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member of class"));

        AssignmentSubmission submission = submissionRepo
                .findByAssignmentIdAndUserId(assignmentId, userId)
                .orElseThrow(() -> new RuntimeException("You have not submitted this assignment"));

        return AssignmentResultResponse.builder()
                .assignmentId(assignment.getId())
                .title(assignment.getTitle())
                .status(submission.getStatus())
                .score(submission.getScore())
                .completedAt(submission.getCompletedAt())
                .build();
    }

    private boolean canManageClass(Long userId, Long classId) {
        return memberRepo.existsByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
    }

    private String generateCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }



}
