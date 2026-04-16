package org.api.quizzz.repository;

import org.api.quizzz.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    /** Lấy submission mới nhất của user cho một assignment (dùng cho backward compat) */
    Optional<AssignmentSubmission> findByAssignmentIdAndUserId(Long assignmentId, Long userId);

    /** Tất cả lần nộp của một user cho một assignment, sắp xếp theo attemptNumber */
    List<AssignmentSubmission> findByAssignmentIdAndUserIdOrderByAttemptNumberAsc(
            Long assignmentId, Long userId);

    /** Số lần đã nộp của user cho một assignment */
    int countByAssignmentIdAndUserId(Long assignmentId, Long userId);

    /** Lấy tất cả submissions của 1 assignment kèm user (tránh N+1) */
    @Query("SELECT s FROM AssignmentSubmission s JOIN FETCH s.user WHERE s.assignment.id = :assignmentId ORDER BY s.user.id, s.attemptNumber")
    List<AssignmentSubmission> findByAssignmentIdFetchUser(@Param("assignmentId") Long assignmentId);
}
