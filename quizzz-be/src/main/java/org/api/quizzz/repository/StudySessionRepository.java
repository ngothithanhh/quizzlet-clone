package org.api.quizzz.repository;

import org.api.quizzz.entity.StudySession;
import org.api.quizzz.enums.StudyMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    @Query("""
        SELECT s FROM StudySession s
        JOIN FETCH s.studySet ss
        WHERE s.user.id = :userId
        AND (:mode IS NULL OR s.mode = :mode)
        AND (:from IS NULL OR s.startedAt >= :from)
        AND (:to IS NULL OR s.startedAt <= :to)
    """)
    Page<StudySession> findSessions(
            @Param("userId") Long userId,
            @Param("mode") StudyMode mode,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );
}
