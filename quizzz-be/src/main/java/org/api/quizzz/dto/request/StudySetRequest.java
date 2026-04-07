package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudySetRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    private Boolean isPublic;
}
