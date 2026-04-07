package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.*;
import org.api.quizzz.entity.*;
import org.api.quizzz.enums.ClassRole;
import org.api.quizzz.repository.*;
import org.api.quizzz.service.ClassService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepo;
    private final ClassMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final AssignmentRepository assignmentRepo;
    private final StudySetRepository studySetRepo;
    private final AssignmentSubmissionRepository submissionRepo;

    // ========== Mapper helpers ==========

    private ClassroomResponse toClassroomResponse(Classroom c) {
        return ClassroomResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .inviteCode(c.getInviteCode())
                .ownerId(c.getOwner().getId())
                .ownerUsername(c.getOwner().getUsername())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private ClassMemberResponse toMemberResponse(ClassMember cm) {
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

    private AssignmentResponse toAssignmentResponse(Assignment a) {
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

    private SubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
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

    // ========== ClassService methods ==========

    @Override
    @Transactional
    public Map<String, Object> createClass(ClassRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        User owner = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Classroom c = Classroom.builder()
                .name(req.getName())
                .description(req.getDescription())
                .inviteCode(generateCode())
                .owner(owner)
                .build();
        classRepo.save(c);

        ClassMember cm = new ClassMember();
        cm.setId(new ClassMemberId(c.getId(), userId));
        cm.setClassroom(c);
        cm.setUser(owner);
        cm.setRole(ClassRole.TEACHER); // Creator mặc định là TEACHER
        cm.setCreator(true);
        memberRepo.save(cm);

        return Map.of(
                "classId", c.getId(),
                "inviteCode", c.getInviteCode()
        );
    }

    @Override
    public ClassroomResponse getClassDetail(Long classId) {
        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        return toClassroomResponse(c);
    }

    @Override
    public List<ClassMemberResponse> getMyClasses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return memberRepo.findByUserId(userId).stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassMemberResponse> getClassMembers(Long classId) {
        classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        return memberRepo.findByClassroomIdAndRole(classId, null).stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClassroomResponse updateClass(Long classId, ClassRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        return toClassroomResponse(classRepo.save(c));
    }

    @Override
    @Transactional
    public void deleteClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");
        classRepo.deleteById(classId);
    }

    @Override
    @Transactional
    public String joinByCode(JoinRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        Classroom c = classRepo.findByInviteCode(req.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        ClassMemberId id = new ClassMemberId(c.getId(), userId);
        if (memberRepo.existsById(id)) throw new RuntimeException("Already joined this class");

        ClassMember cm = new ClassMember();
        cm.setId(id);
        cm.setClassroom(c);
        cm.setUser(userRepo.findById(userId).orElseThrow());
        cm.setRole(ClassRole.STUDENT);
        cm.setCreator(false);
        memberRepo.save(cm);

        return "Tham gia lớp thành công";
    }

    @Override
    @Transactional
    public Map<String, String> regenerateCode(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        c.setInviteCode(generateCode());
        return Map.of("inviteCode", classRepo.save(c).getInviteCode());
    }

    @Override
    @Transactional
    public String addMember(Long classId, AddMemberRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId)) throw new RuntimeException("Forbidden");

        ClassMemberId id = new ClassMemberId(classId, req.getUserId());
        if (memberRepo.existsById(id)) throw new RuntimeException("User already in class");

        ClassMember cm = new ClassMember();
        cm.setId(id);
        cm.setClassroom(classRepo.getReferenceById(classId));
        cm.setUser(userRepo.getReferenceById(req.getUserId()));
        cm.setRole(req.getRole());
        cm.setCreator(false);
        memberRepo.save(cm);

        return "Thêm thành viên thành công";
    }

    @Override
    @Transactional
    public void removeMember(Long classId, Long targetUserId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (!canManageClass(userId, classId) && !userId.equals(targetUserId))
            throw new RuntimeException("Forbidden");

        memberRepo.deleteById(new ClassMemberId(classId, targetUserId));
    }

    @Override
    @Transactional
    public String leaveClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();

        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        if (member.isCreator()) {
            throw new RuntimeException("Creator cannot leave class. Please delete the class instead.");
        }

        memberRepo.delete(member);
        return "Rời lớp thành công";
    }

    @Override
    @Transactional
    public ClassMemberResponse updateMemberRole(Long classId, Long targetUserId, ClassRole newRole) {
        Long userId = SecurityUtils.getCurrentUserId();
        ClassMember creator = memberRepo.findByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
        if (creator == null) throw new RuntimeException("Forbidden: Only class creator can update roles");

        ClassMember target = memberRepo.findByClassroomIdAndUserId(classId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found in this class"));

        target.setRole(newRole);
        return toMemberResponse(memberRepo.save(target));
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(Long classId, AssignmentRequest req) {
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

        return toAssignmentResponse(assignmentRepo.save(assignment));
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        return assignmentRepo.findByClassroomId(classId).stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String submitAssignment(Long assignmentId, SubmitAssignmentRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member of this class"));

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
        return "Nộp bài thành công";
    }

    @Override
    public AssignmentResultResponse getMyResult(Long assignmentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member of this class"));

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

    @Override
    public List<SubmissionResponse> getSubmissions(Long assignmentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        ClassMember member = memberRepo.findByClassroomIdAndUserId(
                assignment.getClassroom().getId(), userId
        ).orElseThrow(() -> new RuntimeException("Not a member of this class"));

        if (member.getRole() != ClassRole.TEACHER && !member.isCreator()) {
            throw new RuntimeException("Forbidden: Only teacher or creator can view submissions");
        }

        return submissionRepo.findByAssignmentId(assignmentId).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    // ========== Helpers ==========

    private boolean canManageClass(Long userId, Long classId) {
        return memberRepo.existsByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
    }

    private String generateCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
