package org.api.quizzz.controller;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.service.FavoriteService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * 9.1 Thêm studyset vào mục favorite
     * POST /api/favorites/{studySetId}
     * - Hỗ trợ cả studyset public của user khác
     * - Idempotent: nếu đã favorite rồi thì bỏ qua
     */
    @PostMapping("/{studySetId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.addFavorite(studySetId);
        return ResponseEntity.ok().build();
    }

    /**
     * 9.2 Xóa studyset ra khỏi mục favorite
     * DELETE /api/favorites/{studySetId}
     */
    @DeleteMapping("/{studySetId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long studySetId) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.removeFavorite(studySetId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 9.3 Lấy toàn bộ studyset từ favorite của user hiện tại
     * GET /api/favorites
     */
    @GetMapping
    public ResponseEntity<List<StudySetResponse>> getFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(favoriteService.getFavorites());
    }
}
