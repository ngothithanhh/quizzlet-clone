package org.api.quizzz.repository;

import org.api.quizzz.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByStudySetIdOrderByPositionAsc(Long id);
    int countByStudySetId(Long studySetId);
}
