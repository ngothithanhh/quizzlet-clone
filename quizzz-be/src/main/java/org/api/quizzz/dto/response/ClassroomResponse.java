package org.api.quizzz.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin lớp học. Không expose trực tiếp entity Classroom
 * để tránh infinite recursion JSON và lộ dữ liệu không cần thiết.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomResponse {
    private Long id;
    private String name;
    private String description;
    private String inviteCode;
    private Long ownerId;
    private String ownerUsername;
    private LocalDateTime createdAt;
    private Integer memberCount;

    /** Dùng Boolean (hộp) thay vì boolean nguyên thủy để tránh Lombok sinh isCreator() → "creator" JSON key */
    @JsonProperty("isCreator")
    private Boolean isCreator;

    /** Role của người đang đăng nhập trong lớp này: TEACHER | STUDENT | null */
    private String currentUserRole;
}
