package org.api.quizzz.repository;

import org.api.quizzz.entity.StudySet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudySetRepository extends JpaRepository<StudySet, Long> {

    List<StudySet> findByUserId(Long userId);

    List<StudySet> findByUserIdAndTitleContainingIgnoreCase(Long userId, String keyword);

    List<StudySet> findByIsPublicTrue();

    List<StudySet> findByTitleContainingIgnoreCaseAndIsPublicTrue(String keyword);
}