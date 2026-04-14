package org.api.quizzz.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.request.FolderRequest;
import org.api.quizzz.dto.response.FolderResponse;
import org.api.quizzz.service.FolderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(@Valid @RequestBody FolderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(folderService.createFolder(request));
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getMyFolders() {
        return ResponseEntity.ok(folderService.getMyFolders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderResponse> getFolderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(folderService.getFolderDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderResponse> updateFolder(
            @PathVariable Long id,
            @Valid @RequestBody FolderRequest request) {
        return ResponseEntity.ok(folderService.updateFolder(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{folderId}/studysets/{studySetId}")
    public ResponseEntity<Void> addStudySetToFolder(
            @PathVariable Long folderId,
            @PathVariable Long studySetId) {
        folderService.addStudySetToFolder(folderId, studySetId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{folderId}/studysets/{studySetId}")
    public ResponseEntity<Void> removeStudySetFromFolder(
            @PathVariable Long folderId,
            @PathVariable Long studySetId) {
        folderService.removeStudySetFromFolder(folderId, studySetId);
        return ResponseEntity.noContent().build();
    }
}
