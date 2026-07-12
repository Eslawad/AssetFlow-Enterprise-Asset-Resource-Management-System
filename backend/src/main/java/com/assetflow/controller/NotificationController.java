package com.assetflow.controller;

import com.assetflow.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    public NotificationController(NotificationService notificationService) { this.notificationService = notificationService; }

    @GetMapping("/user/{userId}") public ResponseEntity<?> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getForUser(userId));
    }

    @GetMapping("/user/{userId}/unread") public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/user/{userId}/read-all") public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId); return ResponseEntity.ok().build();
    }
}
