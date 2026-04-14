package org.api.quizzz.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.api.quizzz.entity.Assignment;
import org.api.quizzz.entity.AssignmentSubmission;
import org.api.quizzz.entity.ClassMember;
import org.api.quizzz.entity.User;
import org.api.quizzz.enums.NotificationType;
import org.api.quizzz.repository.AssignmentRepository;
import org.api.quizzz.repository.AssignmentSubmissionRepository;
import org.api.quizzz.repository.NotificationRepository;
import org.api.quizzz.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    // Chạy mỗi giờ (0 phút, 0 giây) - tuỳ config
    // @Scheduled(cron = "0 0 * * * *") 
    // Tạm thời để 5 phút để test cho dễ, có thể thay đổi sau.
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void notifyOverdueAssignments() {
        log.info("Running NotificationScheduler for overdue assignments at {}", LocalDateTime.now());

        // Lấy tất cả assignment quá hạn
        List<Assignment> overdueAssignments = assignmentRepository.findByDueDateBefore(LocalDateTime.now());

        for (Assignment assignment : overdueAssignments) {
            List<ClassMember> members = assignment.getClassroom().getMembers();
            
            for (ClassMember member : members) {
                User user = member.getUser();
                
                // Bỏ qua người tạo
                if (user.getId().equals(assignment.getAssignedBy().getId())) {
                    continue;
                }

                // Kiểm tra xem đã nộp bài chưa
                Optional<AssignmentSubmission> submission = submissionRepository.findByAssignmentIdAndUserId(assignment.getId(), user.getId());
                
                if (submission.isEmpty()) {
                    // Chưa nộp bài -> Kiểm tra xem đã thông báo quá hạn bao giờ chưa
                    boolean alreadyNotified = notificationRepository.existsByUserIdAndReferenceIdAndType(
                            user.getId(), 
                            assignment.getId(), 
                            NotificationType.ASSIGNMENT_OVERDUE
                    );

                    if (!alreadyNotified) {
                        // Chưa thông báo -> Gửi thông báo
                        notificationService.createNotification(
                                user.getId(),
                                "Bài tập quá hạn!",
                                "Bạn chưa nộp bài tập '" + assignment.getTitle() + "' trong lớp '" + assignment.getClassroom().getName() + "'. Hạn chót là " + assignment.getDueDate() + ".",
                                NotificationType.ASSIGNMENT_OVERDUE,
                                assignment.getId(),
                                "ASSIGNMENT"
                        );
                        log.info("Sent ASSIGNMENT_OVERDUE notification to User {} for Assignment {}", user.getId(), assignment.getId());
                    }
                }
            }
        }
    }
}
