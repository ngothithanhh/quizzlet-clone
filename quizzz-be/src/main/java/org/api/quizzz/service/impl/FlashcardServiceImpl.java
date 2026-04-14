package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.api.quizzz.dto.request.FlashcardRequest;
import org.api.quizzz.dto.response.FlashcardResponse;
import org.api.quizzz.entity.Flashcard;
import org.api.quizzz.entity.StudySet;
import org.api.quizzz.mapper.FlashcardMapper;
import org.api.quizzz.repository.FlashcardRepository;
import org.api.quizzz.repository.StudySetRepository;
import org.api.quizzz.service.FlashcardService;
import org.api.quizzz.utils.SecurityUtils;
import org.api.quizzz.dto.request.CloneFlashcardsRequest;
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

        return FlashcardMapper.toResponse(flashcardRepository.save(flashcard));
    }

    @Override
    @Transactional
    public FlashcardResponse updateFlashcard(Long id, FlashcardRequest request) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard không tồn tại với ID: " + id));

        flashcard.setTerm(request.getTerm());
        flashcard.setDefinition(request.getDefinition());
        if (request.getImageUrl() != null)
            flashcard.setImageUrl(request.getImageUrl());
        if (request.getAudioUrl() != null)
            flashcard.setAudioUrl(request.getAudioUrl());
        if (request.getPosition() != null)
            flashcard.setPosition(request.getPosition());

        return FlashcardMapper.toResponse(flashcardRepository.save(flashcard));
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
                .map(FlashcardMapper::toResponse)
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
                if (row.getRowNum() == 0)
                    continue; // Bỏ qua dòng header

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

    @Override
    @Transactional
    public void cloneFlashcards(CloneFlashcardsRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Kiểm tra StudySet đích
        StudySet targetStudySet = studySetRepository.findById(request.getTargetStudySetId())
                .orElseThrow(
                        () -> new RuntimeException("StudySet đích không tồn tại: " + request.getTargetStudySetId()));

        if (!targetStudySet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Bạn không có quyền thêm flashcard vào StudySet này.");
        }

        List<Flashcard> sourceFlashcards = new ArrayList<>();

        if (request.getSourceStudySetId() != null) {
            StudySet sourceStudySet = studySetRepository.findById(request.getSourceStudySetId())
                    .orElseThrow(() -> new RuntimeException("StudySet nguồn không tồn tại"));

            // Nếu không phải của mình và không public -> Báo lỗi
            if (!sourceStudySet.getUser().getId().equals(userId) && !sourceStudySet.getIsPublic()) {
                throw new RuntimeException("Forbidden: Bạn không có quyền copy tài liệu private của người khác.");
            }

            sourceFlashcards = flashcardRepository.findByStudySetIdOrderByPositionAsc(sourceStudySet.getId());
        } else if (request.getSourceFlashcardIds() != null && !request.getSourceFlashcardIds().isEmpty()) {
            List<Flashcard> cards = flashcardRepository.findAllById(request.getSourceFlashcardIds());
            for (Flashcard card : cards) {
                StudySet ss = card.getStudySet();
                if (!ss.getUser().getId().equals(userId) && !ss.getIsPublic()) {
                    throw new RuntimeException(
                            "Forbidden: Phát hiện flashcard thuộc StudySet private mà bạn không được phép copy.");
                }
                sourceFlashcards.add(card);
            }
        } else {
            throw new RuntimeException("Vui lòng cung cấp sourceStudySetId hoặc mảng sourceFlashcardIds.");
        }

        if (sourceFlashcards.isEmpty()) {
            return;
        }

        // Tìm vị trí max hiện tại của class đích
        int maxPosition = flashcardRepository.findByStudySetIdOrderByPositionAsc(targetStudySet.getId())
                .stream()
                .mapToInt(Flashcard::getPosition)
                .max()
                .orElse(-1);

        List<Flashcard> clonedFlashcards = new ArrayList<>();
        for (Flashcard orig : sourceFlashcards) {
            maxPosition++;
            clonedFlashcards.add(Flashcard.builder()
                    .studySet(targetStudySet)
                    .term(orig.getTerm())
                    .definition(orig.getDefinition())
                    .imageUrl(orig.getImageUrl())
                    .audioUrl(orig.getAudioUrl())
                    .position(maxPosition)
                    .build());
        }

        flashcardRepository.saveAll(clonedFlashcards);
    }

    @Override
    public byte[] exportFlashcardsToExcel(Long studySetId) {
        if (!studySetRepository.existsById(studySetId)) {
            throw new RuntimeException("StudySet không tồn tại với ID: " + studySetId);
        }

        List<Flashcard> flashcards = flashcardRepository.findByStudySetIdOrderByPositionAsc(studySetId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Flashcards");

            // Header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Term");
            headerRow.createCell(1).setCellValue("Definition");
            headerRow.createCell(2).setCellValue("Image URL");
            headerRow.createCell(3).setCellValue("Audio URL");

            // Data rows
            int rowNum = 1;
            for (Flashcard fc : flashcards) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(fc.getTerm() != null ? fc.getTerm() : "");
                row.createCell(1).setCellValue(fc.getDefinition() != null ? fc.getDefinition() : "");
                row.createCell(2).setCellValue(fc.getImageUrl() != null ? fc.getImageUrl() : "");
                row.createCell(3).setCellValue(fc.getAudioUrl() != null ? fc.getAudioUrl() : "");
            }

            // Auto-size columns
            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file Excel: " + e.getMessage());
        }
    }

    @Override
    public byte[] downloadTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Template");

            // Header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Term");
            headerRow.createCell(1).setCellValue("Definition");

            // Example data row
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("Hello");
            exampleRow.createCell(1).setCellValue("Xin chào");

            // Auto-size columns
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file Excel mẫu: " + e.getMessage());
        }
    }
}
