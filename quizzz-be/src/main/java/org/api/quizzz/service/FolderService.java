package org.api.quizzz.service;

import org.api.quizzz.dto.request.FolderRequest;
import org.api.quizzz.dto.response.FolderResponse;

import java.util.List;

public interface FolderService {
    FolderResponse createFolder(FolderRequest request);

    FolderResponse updateFolder(Long id, FolderRequest request);

    void deleteFolder(Long id);

    void addStudySetToFolder(Long folderId, Long studySetId);

    void removeStudySetFromFolder(Long folderId, Long studySetId);

    List<FolderResponse> getMyFolders();

    FolderResponse getFolderDetail(Long folderId);
}
