package org.api.quizzz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.api.quizzz.enums.ClassRole;

/**
 * DTO trả về thông tin thành viên lớp. Không expose trực tiếp entity ClassMember.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassMemberResponse {
    private Long userId;
    private String username;
    private String email;
    private String avatarUrl;
    private ClassRole role;
    private boolean isCreator;
}
