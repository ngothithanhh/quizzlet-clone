package org.api.quizzz.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.service.StudySetService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/studysets")
@RequiredArgsConstructor
public class StudySetController {

    private final StudySetService studySetService;

    /**
     * 2.1 Tạo StudySet
     * POST /api/studysets
     */
    @PostMapping
    public ResponseEntity<StudySetResponse> create(@Valid @RequestBody StudySetRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(studySetService.createStudySet(userId, request));
    }

    /**
     * 2.2 Lấy toàn bộ StudySet của user hiện tại (cả public lẫn private)
     * GET /api/studysets/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<StudySetResponse>> getMyStudySets() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studySetService.getMyStudySets(userId));
    }

    /**
     * 2.3 Tìm kiếm StudySet public của toàn hệ thống
     * GET /api/studysets?keyword=english
     * - Không truyền keyword: trả toàn bộ StudySet public
     * - Có keyword: lọc theo title
     */
    @GetMapping
    public ResponseEntity<List<StudySetResponse>> getAll(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(studySetService.getAll(keyword));
    }

    /**
     * 2.3 Lấy chi tiết StudySet (bao gồm danh sách flashcards)
     * GET /api/studysets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudySetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studySetService.getById(id));
    }

    /**
     * 2.4 Cập nhật StudySet
     * PUT /api/studysets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudySetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody StudySetRequest request) {
        return ResponseEntity.ok(studySetService.updateStudySet(id, request));
    }

    /**
     * 2.5 Xóa StudySet
     * DELETE /api/studysets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studySetService.deleteStudySet(id);
        return ResponseEntity.noContent().build();
    }
}
