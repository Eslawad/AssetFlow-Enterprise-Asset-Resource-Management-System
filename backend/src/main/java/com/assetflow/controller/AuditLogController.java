package com.assetflow.controller;

import com.assetflow.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/audit")
public class AuditLogController {
    private final AuditLogService auditLogService;
    public AuditLogController(AuditLogService auditLogService) { this.auditLogService = auditLogService; }

    @GetMapping("/recent") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> getRecent() { return ResponseEntity.ok(auditLogService.getRecent()); }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<?> getForAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(auditLogService.getForAsset(assetId));
    }
}
