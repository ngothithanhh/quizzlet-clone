package org.api.quizzz.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FolderRequest {
    @NotBlank(message = "Tên thư mục không được để trống")
    private String name;
}
