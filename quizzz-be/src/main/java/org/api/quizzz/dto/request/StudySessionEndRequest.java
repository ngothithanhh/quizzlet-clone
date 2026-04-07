package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudySessionEndRequest {
    @NotNull(message = "Session ID không được để trống")
    private Long sessionId;
}
