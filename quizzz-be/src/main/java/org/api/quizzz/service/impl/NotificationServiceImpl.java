package org.api.quizzz.service.impl;

import lombok.RequiredArgsConstructor;
import org.api.quizzz.dto.response.NotificationResponse;
import org.api.quizzz.entity.Notification;
import org.api.quizzz.entity.User;
import org.api.quizzz.enums.NotificationType;
import org.api.quizzz.repository.NotificationRepository;
import org.api.quizzz.repository.UserRepository;
import org.api.quizzz.service.NotificationService;
import org.api.quizzz.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createNotification(Long userId, String title, String content, NotificationType type, Long referenceId, String referenceType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getMyNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .content(n.getContent())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .referenceId(n.getReferenceId())
                        .referenceType(n.getReferenceType())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: Not your notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    public long getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
