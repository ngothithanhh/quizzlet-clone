package org.api.quizzz.service;

import org.api.quizzz.dto.response.StudySetResponse;

import java.util.List;

public interface FavoriteService {

    /** 9.1 Thêm studyset vào mục favorite */
    void addFavorite(Long studySetId);

    /** 9.2 Xóa studyset ra khỏi mục favorite */
    void removeFavorite(Long studySetId);

    /** 9.3 Lấy toàn bộ studyset từ favorite */
    List<StudySetResponse> getFavorites();
}
