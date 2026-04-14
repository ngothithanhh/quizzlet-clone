package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.FolderRequest;
import org.api.quizzz.dto.response.FolderResponse;
import org.api.quizzz.entity.Folder;
import org.api.quizzz.entity.FolderStudySet;
import org.api.quizzz.entity.FolderStudySetId;
import org.api.quizzz.entity.StudySet;
import org.api.quizzz.entity.User;
import org.api.quizzz.mapper.FolderMapper;
import org.api.quizzz.repository.FolderRepository;
import org.api.quizzz.repository.FolderStudySetRepository;
import org.api.quizzz.repository.StudySetRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.FolderService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final FolderStudySetRepository folderStudySetRepository;
    private final StudySetRepository studySetRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public FolderResponse createFolder(FolderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (folderRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new RuntimeException("Tên thư mục đã tồn tại.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = Folder.builder()
                .name(request.getName())
                .user(user)
                .build();

        return FolderMapper.toResponse(folderRepository.save(folder));
    }

    @Override
    @Transactional
    public FolderResponse updateFolder(Long id, FolderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!folder.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Không phải thư mục của bạn");
        }

        if (!folder.getName().equals(request.getName()) && 
            folderRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new RuntimeException("Tên thư mục đã tồn tại.");
        }

        folder.setName(request.getName());
        return FolderMapper.toResponse(folderRepository.save(folder));
    }

    @Override
    @Transactional
    public void deleteFolder(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();

        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!folder.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Không phải thư mục của bạn");
        }

        folderRepository.delete(folder);
    }

    @Override
    @Transactional
    public void addStudySetToFolder(Long folderId, Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!folder.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Kém quyền truy cập");
        }

        StudySet studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("StudySet không tồn tại"));

        // Only allow adding user's own studySet or public studySet
        if (!studySet.getUser().getId().equals(userId) && !studySet.getIsPublic()) {
            throw new RuntimeException("Forbidden: StudySet private của người khác");
        }

        if (folderStudySetRepository.existsByIdFolderIdAndIdStudySetId(folderId, studySetId)) {
            return; // Đã thêm rồi, idempotent
        }

        FolderStudySet fs = FolderStudySet.builder()
                .id(new FolderStudySetId(folderId, studySetId))
                .folder(folder)
                .studySet(studySet)
                .build();

        folderStudySetRepository.save(fs);
    }

    @Override
    @Transactional
    public void removeStudySetFromFolder(Long folderId, Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!folder.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Kém quyền truy cập");
        }

        FolderStudySetId id = new FolderStudySetId(folderId, studySetId);
        if (folderStudySetRepository.existsById(id)) {
            folderStudySetRepository.deleteById(id);
        }
    }

    @Override
    public List<FolderResponse> getMyFolders() {
        Long userId = SecurityUtils.getCurrentUserId();
        return folderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(FolderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FolderResponse getFolderDetail(Long folderId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Folder folder = folderRepository.findByIdWithStudySets(folderId)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!folder.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Kém quyền truy cập");
        }

        return FolderMapper.toResponse(folder);
    }
}
