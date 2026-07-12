package com.assetflow.service;

import com.assetflow.model.AuditLog;
import com.assetflow.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String entityType, Long entityId, String action, String details, Long performedBy) {
        auditLogRepository.save(new AuditLog(entityType, entityId, action, details, performedBy));
    }

    public List<AuditLog> getForAsset(Long assetId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByPerformedAtDesc("ASSET", assetId);
    }

    public List<AuditLog> getRecent() {
        return auditLogRepository.findTop50ByOrderByPerformedAtDesc();
    }
}
