package org.api.quizzz.repository;

import org.api.quizzz.entity.FolderStudySet;
import org.api.quizzz.entity.FolderStudySetId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderStudySetRepository extends JpaRepository<FolderStudySet, FolderStudySetId> {
    
    boolean existsByIdFolderIdAndIdStudySetId(Long folderId, Long studySetId);
    
}
