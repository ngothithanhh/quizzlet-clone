package org.api.quizzz.service;

import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.StudySetResponse;

import java.util.List;

public interface StudySetService {
    StudySetResponse createStudySet(Long userId, StudySetRequest request);
    StudySetResponse getById(Long id);

    /** Lấy tất cả StudySet (kể cả private) của user hiện tại */
    List<StudySetResponse> getMyStudySets(Long userId);

    /** Tìm kiếm toàn bộ StudySet public trong hệ thống */
    List<StudySetResponse> getAll(String keyword);

    StudySetResponse updateStudySet(Long id, StudySetRequest request);
    void deleteStudySet(Long id);
}
