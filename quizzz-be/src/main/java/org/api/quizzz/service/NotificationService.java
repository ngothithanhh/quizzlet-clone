package org.api.quizzz.service;

import org.api.quizzz.dto.response.NotificationResponse;
import org.api.quizzz.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void createNotification(Long userId, String title, String content, NotificationType type, Long referenceId, String referenceType);

    List<NotificationResponse> getMyNotifications();

    void markAsRead(Long notificationId);

    void markAllAsRead();

    long getUnreadCount();
}
