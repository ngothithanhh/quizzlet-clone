package org.api.quizzz.service;

import org.api.quizzz.dto.request.FlashcardRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.springframework.web.multipart.MultipartFile;
import org.api.quizzz.dto.request.CloneFlashcardsRequest;

import java.util.List;
import java.util.Map;

public interface FlashcardService {
    FlashcardResponse createFlashcard(FlashcardRequest request);

    FlashcardResponse updateFlashcard(Long id, FlashcardRequest request);

    void deleteFlashcard(Long id);

    List<FlashcardResponse> getFlashcardsByStudySet(Long studySetId);

    void importFlashcards(Long studySetId, MultipartFile file);

    /** Chỉ parse Excel, không lưu DB. Dùng cho việc tạo mới study set từ file Excel. */
    List<Map<String, String>> parseExcel(MultipartFile file);

    void cloneFlashcards(CloneFlashcardsRequest request);

    byte[] exportFlashcardsToExcel(Long studySetId);

    byte[] downloadTemplate();
}
