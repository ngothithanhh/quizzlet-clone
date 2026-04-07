package org.api.quizzz.repository;

import org.api.quizzz.entity.StudySessionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudySessionDetailRepository extends JpaRepository<StudySessionDetail, Long> {
    List<StudySessionDetail> findBySessionId(Long sessionId);
}
