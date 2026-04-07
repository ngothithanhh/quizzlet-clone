package org.api.quizzz.dto.request.classroom;

import lombok.Data;
import org.api.quizzz.enums.ClassRole;

@Data
public class AddMemberRequest {
    private Long userId;
    private ClassRole role;
}
