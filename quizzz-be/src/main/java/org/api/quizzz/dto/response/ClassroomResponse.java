package org.api.quizzz.dto.response;

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
}
