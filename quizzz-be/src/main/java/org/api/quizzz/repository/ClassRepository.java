package org.api.quizzz.repository;

import org.api.quizzz.entity.Classroom;
import org.api.quizzz.enums.ClassRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClassRepository extends JpaRepository<Classroom,Long> {
    Optional<Classroom> findByInviteCode(String code);
}
