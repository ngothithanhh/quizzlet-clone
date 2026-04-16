package org.api.quizzz.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.FlashcardRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.service.FlashcardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    /**
     * 3.1 Tạo flashcard
     * POST /api/flashcards
     */
    @PostMapping("/api/flashcards")
    public ResponseEntity<FlashcardResponse> createFlashcard(@Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flashcardService.createFlashcard(request));
    }

    /**
     * 3.2 Cập nhật flashcard
     * PUT /api/flashcards/{id}
     */
    @PutMapping("/api/flashcards/{id}")
    public ResponseEntity<FlashcardResponse> updateFlashcard(
            @PathVariable Long id,
            @Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.ok(flashcardService.updateFlashcard(id, request));
    }

    /**
     * 3.3 Xóa flashcard
     * DELETE /api/flashcards/{id}
     */
    @DeleteMapping("/api/flashcards/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 3.4 Lấy flashcard theo study set
     * GET /api/studysets/{id}/flashcards
     */
    @GetMapping("/api/studysets/{studySetId}/flashcards")
    public ResponseEntity<List<FlashcardResponse>> getFlashcardsByStudySet(@PathVariable Long studySetId) {
        return ResponseEntity.ok(flashcardService.getFlashcardsByStudySet(studySetId));
    }

    /**
     * 3.5 Import flashcard từ file Excel (.xlsx)
     * POST /api/studysets/{id}/flashcards/import
     * File Excel cần có 2 cột: Cột A = Term, Cột B = Definition (dòng đầu là header)
     */
    @PostMapping("/api/studysets/{studySetId}/flashcards/import")
    public ResponseEntity<Map<String, String>> importFlashcards(
            @PathVariable Long studySetId,
            @RequestParam("file") MultipartFile file) {
        flashcardService.importFlashcards(studySetId, file);
        return ResponseEntity.ok(Map.of("message", "Import flashcard thành công"));
    }

    /**
     * 3.6 Clone/Copy flashcards từ nguồn khác
     * POST /api/flashcards/clone
     */
    @PostMapping("/api/flashcards/clone")
    public ResponseEntity<Map<String, String>> cloneFlashcards(@Valid @RequestBody org.api.quizzz.dto.request.CloneFlashcardsRequest request) {
        flashcardService.cloneFlashcards(request);
        return ResponseEntity.ok(Map.of("message", "Sao chép flashcards thành công"));
    }

    /**
     * 3.7 Export flashcards ra file Excel
     * GET /api/studysets/{studySetId}/flashcards/export
     */
    @GetMapping("/api/studysets/{studySetId}/flashcards/export")
    public ResponseEntity<byte[]> exportFlashcards(@PathVariable Long studySetId) {
        byte[] excelBytes = flashcardService.exportFlashcardsToExcel(studySetId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "flashcards_" + studySetId + ".xlsx");

        return ResponseEntity.ok().headers(headers).body(excelBytes);
    }

    /**
     * 3.8 Tải file Excel mẫu để import flashcards
     * GET /api/flashcards/import/template
     */
    @GetMapping("/api/flashcards/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] excelBytes = flashcardService.downloadTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "flashcards_template.xlsx");
        return ResponseEntity.ok().headers(headers).body(excelBytes);
    }

    /**
     * 3.9 Parse flashcard từ file Excel mà KHÔNG lưu vào DB
     * POST /api/flashcards/parse-excel
     * Dùng khi tạo mới Study Set từ file Excel.
     */
    @PostMapping("/api/flashcards/parse-excel")
    public ResponseEntity<List<Map<String, String>>> parseExcel(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(flashcardService.parseExcel(file));
    }
}

