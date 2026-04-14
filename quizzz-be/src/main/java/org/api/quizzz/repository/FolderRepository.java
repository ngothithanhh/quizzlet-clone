package org.api.quizzz.repository;

import org.api.quizzz.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.folderStudySets fs LEFT JOIN FETCH fs.studySet WHERE f.id = :folderId")
    Optional<Folder> findByIdWithStudySets(@Param("folderId") Long folderId);
}
