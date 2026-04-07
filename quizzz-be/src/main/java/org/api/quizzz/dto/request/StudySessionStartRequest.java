package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.api.quizzz.enums.StudyMode;

@Data
public class StudySessionStartRequest {
    @NotNull(message = "StudySet ID không được để trống")
    private Long studySetId;
    
    private StudyMode mode;
}
