package org.api.quizzz.repository;

import org.api.quizzz.entity.ClassMember;
import org.api.quizzz.entity.ClassMemberId;
import org.api.quizzz.enums.ClassRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, ClassMemberId> {
    boolean existsByClassroomIdAndUserIdAndRole(Long classId, Long userId, ClassRole role);

    boolean existsByClassroomIdAndUserIdAndIsCreatorTrue(Long classId, Long userId);

    Optional<ClassMember> findByClassroomIdAndIsCreatorTrue(Long classId);

    Optional<ClassMember> findByClassroomIdAndUserId(Long classId, Long userId);

    /** Lấy toàn bộ ClassMember của user kèm Classroom, Owner, Members (tránh LazyInit) */
    @Query("SELECT DISTINCT cm FROM ClassMember cm " +
           "JOIN FETCH cm.classroom c " +
           "JOIN FETCH c.owner " +
           "LEFT JOIN FETCH c.members m " +
           "LEFT JOIN FETCH m.user " +
           "WHERE cm.user.id = :userId")
    List<ClassMember> findByUserIdWithClassroom(@Param("userId") Long userId);

    /** Lấy toàn bộ thành viên của lớp kèm User */
    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.user WHERE cm.classroom.id = :classId")
    List<ClassMember> findByClassroomIdWithUser(@Param("classId") Long classId);

    List<ClassMember> findByUserId(Long userId);

    List<ClassMember> findByClassroomIdAndRole(Long classId, ClassRole role);

    ClassMember findByClassroomIdAndUserIdAndIsCreatorTrue(Long classId, Long userId);
}
