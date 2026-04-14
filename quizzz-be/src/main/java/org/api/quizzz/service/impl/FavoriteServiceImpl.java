package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.entity.Favorite;
import org.api.quizzz.entity.FavoriteId;
import org.api.quizzz.entity.StudySet;
import org.api.quizzz.entity.User;
import org.api.quizzz.mapper.FavoriteMapper;
import org.api.quizzz.repository.FavoriteRepository;
import org.api.quizzz.repository.StudySetRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.FavoriteService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final StudySetRepository studySetRepository;

    // ========== Service methods ==========

    /**
     * 9.1 Thêm studyset vào mục favorite.
     * Hỗ trợ cả studyset public của user khác.
     * Nếu đã favorite rồi thì bỏ qua (idempotent).
     */
    @Override
    @Transactional
    public void addFavorite(Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (favoriteRepository.existsByIdUserIdAndIdStudySetId(userId, studySetId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        StudySet studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("StudySet not found with ID: " + studySetId));

        Favorite favorite = Favorite.builder()
                .id(new FavoriteId(userId, studySetId))
                .user(user)
                .studySet(studySet)
                .build();

        favoriteRepository.save(favorite);
    }

    /**
     * 9.2 Xóa studyset ra khỏi mục favorite.
     * Nếu chưa favorite thì báo lỗi.
     */
    @Override
    @Transactional
    public void removeFavorite(Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FavoriteId id = new FavoriteId(userId, studySetId);
//        if (!favoriteRepository.existsById(id)) {
//            throw new RuntimeException("Favorite not found for userId=" + userId + ", studySetId=" + studySetId);
//        }
//        favoriteRepository.deleteById(id);
        if (favoriteRepository.existsById(id)) {
            favoriteRepository.deleteById(id);
        }
        //nó đã không có sẵn rồi, hệ thống coi như đã đạt mục đích và có thể trả về thành công
    }

    /**
     * 9.3 Lấy toàn bộ studyset từ mục favorite của user hiện tại.
     */
    @Override
    public List<StudySetResponse> getFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        return favoriteRepository.findStudySetsByUserId(userId)
                .stream()
                .map(FavoriteMapper::toResponse)
                .collect(Collectors.toList());
    }
}
