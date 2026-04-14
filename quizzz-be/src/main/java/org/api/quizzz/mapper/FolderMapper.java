package org.api.quizzz.mapper;

import org.api.quizzz.dto.response.FolderResponse;
import org.api.quizzz.dto.response.StudySetResponse;
import org.api.quizzz.entity.Folder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FolderMapper {
    private FolderMapper() {}

    public static FolderResponse toResponse(Folder folder) {
        List<StudySetResponse> studySets = new ArrayList<>();
        
        if (folder.getFolderStudySets() != null) {
            studySets = folder.getFolderStudySets().stream()
                    .map(fs -> StudySetMapper.toResponse(fs.getStudySet()))
                    .collect(Collectors.toList());
        }

        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .username(folder.getUser() != null ? folder.getUser().getUsername() : null)
                .studySets(studySets)
                .build();
    }
}
