package org.api.quizzz.repository;

import org.api.quizzz.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClassRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByInviteCode(String code);

    /** Lấy chi tiết lớp kèm Owner và Members để tránh LazyInit */
    @Query("SELECT DISTINCT c FROM Classroom c " +
           "JOIN FETCH c.owner " +
           "LEFT JOIN FETCH c.members m " +
           "LEFT JOIN FETCH m.user " +
           "WHERE c.id = :classId")
    Optional<Classroom> findByIdWithDetails(@Param("classId") Long classId);
}
