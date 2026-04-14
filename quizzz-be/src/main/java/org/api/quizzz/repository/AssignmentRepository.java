package org.api.quizzz.repository;

import org.api.quizzz.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment,Long> {
    List<Assignment> findByClassroomId(Long classId);

    List<Assignment> findByDueDateBefore(java.time.LocalDateTime time);
}
