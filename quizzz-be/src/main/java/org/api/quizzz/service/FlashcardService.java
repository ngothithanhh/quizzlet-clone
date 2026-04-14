package org.api.quizzz.service;

import org.api.quizzz.dto.request.FlashcardRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.springframework.web.multipart.MultipartFile;
import org.api.quizzz.dto.request.CloneFlashcardsRequest;

import java.util.List;

public interface FlashcardService {
    FlashcardResponse createFlashcard(FlashcardRequest request);

    FlashcardResponse updateFlashcard(Long id, FlashcardRequest request);

    void deleteFlashcard(Long id);

    List<FlashcardResponse> getFlashcardsByStudySet(Long studySetId);

    void importFlashcards(Long studySetId, MultipartFile file);

    void cloneFlashcards(CloneFlashcardsRequest request);

    byte[] exportFlashcardsToExcel(Long studySetId);
}
