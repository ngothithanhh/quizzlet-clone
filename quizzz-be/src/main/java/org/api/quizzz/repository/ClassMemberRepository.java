package org.api.quizzz.repository;

import org.api.quizzz.entity.ClassMember;
import org.api.quizzz.entity.ClassMemberId;
import org.api.quizzz.enums.ClassRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, ClassMemberId> {
    boolean existsByClassroomIdAndUserIdAndRole(Long classId, Long userId, ClassRole role);

    boolean existsByClassroomIdAndUserIdAndIsCreatorTrue(Long classId, Long userId);

    Optional<ClassMember> findByClassroomIdAndIsCreatorTrue(Long classId);

    Optional<ClassMember> findByClassroomIdAndUserId(Long classId, Long userId);

    List<ClassMember> findByUserId(Long userId);

    List<ClassMember> findByClassroomIdAndRole(Long classId, ClassRole role);

    ClassMember findByClassroomIdAndUserIdAndIsCreatorTrue(Long classId, Long userId);


}
