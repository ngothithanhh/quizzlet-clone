package org.api.quizzz.service;

import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.StudySetResponse;

import java.util.List;

public interface StudySetService {
    StudySetResponse createStudySet(Long userId, StudySetRequest request);
    StudySetResponse getById(Long id);
    List<StudySetResponse> getAll(Long userId, String keyword);
    StudySetResponse updateStudySet(Long id, StudySetRequest request);
    void deleteStudySet(Long id);
}
