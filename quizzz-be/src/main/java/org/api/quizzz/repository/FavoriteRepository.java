package org.api.quizzz.repository;

import org.api.quizzz.entity.Favorite;
import org.api.quizzz.entity.FavoriteId;
import org.api.quizzz.entity.StudySet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    /** Lấy toàn bộ StudySet (kèm flashcards) đã được yêu thích của user */
    @Query("SELECT DISTINCT ss FROM Favorite f JOIN f.studySet ss LEFT JOIN FETCH ss.flashcards WHERE f.user.id = :userId")
    List<StudySet> findStudySetsByUserId(@Param("userId") Long userId);

    /** Kiểm tra user đã favorite studySet chưa */
    boolean existsByIdUserIdAndIdStudySetId(Long userId, Long studySetId);
}
