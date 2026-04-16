package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.classroom.*;
import org.api.quizzz.dto.response.*;
import org.api.quizzz.entity.*;
import org.api.quizzz.enums.ClassRole;
import org.api.quizzz.mapper.ClassMapper;
import org.api.quizzz.mapper.StudySetMapper;
import org.api.quizzz.repository.*;
import org.api.quizzz.service.ClassService;
import org.api.quizzz.service.NotificationService;
import org.api.quizzz.enums.NotificationType;
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
    private final NotificationService notificationService;



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
        cm.setRole(null); // Người tạo lớp chỉ là chủ lớp (isCreator=true), không có role cụ thể
        cm.setCreator(true);
        memberRepo.save(cm);

        return Map.of(
                "classId", c.getId(),
                "inviteCode", c.getInviteCode()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ClassroomResponse getClassDetail(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        // JOIN FETCH để load owner + members trong 1 query, tránh LazyInit
        Classroom c = classRepo.findByIdWithDetails(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        return ClassMapper.toClassroomResponse(c, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassroomResponse> getMyClasses() {
        Long userId = SecurityUtils.getCurrentUserId();
        // JOIN FETCH classroom + owner + members trong 1 query
        return memberRepo.findByUserIdWithClassroom(userId).stream()
                .map(cm -> ClassMapper.toClassroomResponse(cm.getClassroom(), userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassMemberResponse> getClassMembers(Long classId) {
        return memberRepo.findByClassroomIdWithUser(classId).stream()
                .map(ClassMapper::toMemberResponse)
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
        return ClassMapper.toClassroomResponse(classRepo.save(c), userId);
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

        // Nofity the teacher (owner)
        notificationService.createNotification(
                c.getOwner().getId(),
                "Thành viên mới",
                "User " + userRepo.findById(userId).get().getUsername() + " đã tham gia lớp " + c.getName(),
                NotificationType.NEW_MEMBER,
                c.getId(),
                "CLASS"
        );

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
        ClassMember actor = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Forbidden: Not a member"));

        // Creator có thể thêm bất kỳ ai; Teacher chỉ được thêm STUDENT
        if (!actor.isCreator()) {
            if (actor.getRole() != ClassRole.TEACHER)
                throw new RuntimeException("Forbidden: Only creator or teacher can add members");
            req.setRole(ClassRole.STUDENT);
        }

        ClassMemberId id = new ClassMemberId(classId, req.getUserId());
        if (memberRepo.existsById(id)) throw new RuntimeException("User already in class");

        ClassMember cm = new ClassMember();
        cm.setId(id);
        cm.setClassroom(classRepo.getReferenceById(classId));
        cm.setUser(userRepo.getReferenceById(req.getUserId()));
        cm.setRole(req.getRole() != null ? req.getRole() : ClassRole.STUDENT);
        cm.setCreator(false);
        memberRepo.save(cm);

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        notificationService.createNotification(
                req.getUserId(), "Lời mời tham gia lớp học",
                "Bạn đã được thêm vào lớp " + c.getName(),
                NotificationType.ADDED_TO_CLASS, c.getId(), "CLASS");
        return "Thêm thành viên thành công";
    }

    @Override
    @Transactional
    public void removeMember(Long classId, Long targetUserId) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (userId.equals(targetUserId)) {
            memberRepo.deleteById(new ClassMemberId(classId, targetUserId));
            return;
        }

        ClassMember actor = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Forbidden"));
        ClassMember target = memberRepo.findByClassroomIdAndUserId(classId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        if (target.isCreator()) throw new RuntimeException("Cannot remove class creator");

        if (actor.isCreator()) {
            // Creator được xóa tất cả
        } else if (actor.getRole() == ClassRole.TEACHER) {
            // Teacher chỉ xóa STUDENT
            if (target.getRole() != ClassRole.STUDENT)
                throw new RuntimeException("Forbidden: Teacher can only remove students");
        } else {
            throw new RuntimeException("Forbidden");
        }

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
        // Chỉ Creator được đổi vai trò thành viên
        ClassMember actorMember = memberRepo.findByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
        if (actorMember == null)
            throw new RuntimeException("Forbidden: Only class creator can change member roles");

        ClassMember target = memberRepo.findByClassroomIdAndUserId(classId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found in this class"));

        if (target.isCreator()) throw new RuntimeException("Cannot change creator's role");

        target.setRole(newRole);
        return ClassMapper.toMemberResponse(memberRepo.save(target));
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(Long classId, AssignmentRequest req) {
        Long userId = SecurityUtils.getCurrentUserId();

        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of class"));

        // Creator và Teacher được tạo bài kiểm tra
        if (!member.isCreator() && member.getRole() != ClassRole.TEACHER)
            throw new RuntimeException("Forbidden: Only teacher or creator can create assignment");

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

        assignment = assignmentRepo.save(assignment);

        // Notify all class members except the creator
        for (ClassMember targetMem : c.getMembers()) {
            if (!targetMem.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        targetMem.getUser().getId(),
                        "Bài tập mới: " + req.getTitle(),
                        "Lớp " + c.getName() + " vừa có bài tập mới.",
                        NotificationType.NEW_ASSIGNMENT,
                        assignment.getId(),
                        "ASSIGNMENT"
                );
            }
        }

        return ClassMapper.toAssignmentResponse(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        return assignmentRepo.findByClassroomId(classId).stream()
                .map(ClassMapper::toAssignmentResponse)
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
                .map(ClassMapper::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    // ========== Study Sets in Class ==========

    @Override
    public List<StudySetResponse> getStudySetsByClass(Long classId) {
        Long userId = SecurityUtils.getCurrentUserId();
        memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        return c.getStudySets().stream()
                .map(StudySetMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String addStudySet(Long classId, Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        if (member.getRole() != ClassRole.TEACHER && !member.isCreator()) {
            throw new RuntimeException("Forbidden: Only teacher or creator can add study set");
        }

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        StudySet ss = studySetRepo.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("StudySet not found"));

        if (!ss.getClassrooms().contains(c)) {
            ss.getClassrooms().add(c);
            studySetRepo.save(ss);
        }

        return "Thêm học phần vào lớp thành công";
    }

    @Override
    @Transactional
    public void removeStudySet(Long classId, Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this class"));

        if (member.getRole() != ClassRole.TEACHER && !member.isCreator()) {
            throw new RuntimeException("Forbidden: Only teacher or creator can remove study set");
        }

        Classroom c = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        StudySet ss = studySetRepo.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("StudySet not found"));

        if (ss.getClassrooms().contains(c)) {
            ss.getClassrooms().remove(c);
            studySetRepo.save(ss);
        }
    }

    // ========== Helpers ==========

    /** Chỉ Creator quản lý lớp (update/delete/change roles) */
    private boolean canManageClass(Long userId, Long classId) {
        return memberRepo.existsByClassroomIdAndUserIdAndIsCreatorTrue(classId, userId);
    }

    /** Creator hoặc Teacher được giảng dạy (thêm STUDENT, tạo assignment) */
    private boolean canTeach(Long userId, Long classId) {
        ClassMember member = memberRepo.findByClassroomIdAndUserId(classId, userId).orElse(null);
        if (member == null) return false;
        return member.isCreator() || member.getRole() == ClassRole.TEACHER;
    }

    private String generateCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
