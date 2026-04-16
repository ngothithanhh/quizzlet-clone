package org.api.quizzz.service;

import org.api.quizzz.dto.request.StudySetRequest;
import org.api.quizzz.dto.response.*;

import java.util.List;

public interface StudySetService {
    StudySetResponse createStudySet(Long userId, StudySetRequest request);
    StudySetResponse getById(Long id);

    /** Lấy tất cả StudySet (kể cả private) của user hiện tại */
    List<StudySetResponse> getMyStudySets(Long userId);

    /** Tìm kiếm StudySet public + riêng tư của user hiện tại */
    List<StudySetResponse> getAll(String keyword, Long currentUserId);

    StudySetResponse updateStudySet(Long id, StudySetRequest request);
    /** Cập nhật chỉ trường isPublic mà không cần gửi toàn bộ request */
    StudySetResponse setVisibility(Long id, boolean isPublic);
    void deleteStudySet(Long id);

    List<MatchCardResponse> getMatchCards(Long id);
    List<LearnCardResponse> getLearnCards(Long id);
    TestCardsResponse getTestCards(Long id);
}
