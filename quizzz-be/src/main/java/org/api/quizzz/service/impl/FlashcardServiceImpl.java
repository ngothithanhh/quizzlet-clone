package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.api.quizzz.dto.request.FlashcardRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.entity.Flashcard;
import org.api.quizzz.entity.StudySet;
import org.api.quizzz.repository.FlashcardRepository;
import org.api.quizzz.repository.StudySetRepository;
import org.api.quizzz.service.FlashcardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardServiceImpl implements FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final StudySetRepository studySetRepository;

    // ========== Mapper helper ==========

    private FlashcardResponse toResponse(Flashcard fc) {
        return FlashcardResponse.builder()
                .id(fc.getId())
                .term(fc.getTerm())
                .definition(fc.getDefinition())
                .imageUrl(fc.getImageUrl())
                .audioUrl(fc.getAudioUrl())
                .position(fc.getPosition())
                .build();
    }

    // ========== Service methods ==========

    @Override
    @Transactional
    public FlashcardResponse createFlashcard(FlashcardRequest request) {
        StudySet studySet = studySetRepository.findById(request.getStudySetId())
                .orElseThrow(() -> new RuntimeException("StudySet không tồn tại với ID: " + request.getStudySetId()));

        Flashcard flashcard = Flashcard.builder()
                .studySet(studySet)
                .term(request.getTerm())
                .definition(request.getDefinition())
                .imageUrl(request.getImageUrl())
                .audioUrl(request.getAudioUrl())
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .build();

        return toResponse(flashcardRepository.save(flashcard));
    }

    @Override
    @Transactional
    public FlashcardResponse updateFlashcard(Long id, FlashcardRequest request) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard không tồn tại với ID: " + id));

        flashcard.setTerm(request.getTerm());
        flashcard.setDefinition(request.getDefinition());
        if (request.getImageUrl() != null) flashcard.setImageUrl(request.getImageUrl());
        if (request.getAudioUrl() != null) flashcard.setAudioUrl(request.getAudioUrl());
        if (request.getPosition() != null) flashcard.setPosition(request.getPosition());

        return toResponse(flashcardRepository.save(flashcard));
    }

    @Override
    @Transactional
    public void deleteFlashcard(Long id) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard không tồn tại với ID: " + id));
        flashcardRepository.delete(flashcard);
    }

    @Override
    public List<FlashcardResponse> getFlashcardsByStudySet(Long studySetId) {
        if (!studySetRepository.existsById(studySetId)) {
            throw new RuntimeException("StudySet không tồn tại với ID: " + studySetId);
        }
        return flashcardRepository.findByStudySetIdOrderByPositionAsc(studySetId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void importFlashcards(Long studySetId, MultipartFile file) {
        StudySet studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("StudySet không tồn tại với ID: " + studySetId));

        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<Flashcard> flashcards = new ArrayList<>();
            DataFormatter formatter = new DataFormatter();

            // Lấy position lớn nhất hiện tại để thêm vào cuối
            int maxPosition = flashcardRepository.findByStudySetIdOrderByPositionAsc(studySetId)
                    .stream()
                    .mapToInt(Flashcard::getPosition)
                    .max()
                    .orElse(-1);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Bỏ qua dòng header

                String term = formatter.formatCellValue(row.getCell(0));
                String definition = formatter.formatCellValue(row.getCell(1));

                if (!term.isBlank() && !definition.isBlank()) {
                    maxPosition++;
                    flashcards.add(Flashcard.builder()
                            .studySet(studySet)
                            .term(term.trim())
                            .definition(definition.trim())
                            .position(maxPosition)
                            .build());
                }
            }

            flashcardRepository.saveAll(flashcards);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage());
        }
    }
}
