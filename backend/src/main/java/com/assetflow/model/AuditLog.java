package com.assetflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String details;
    private Long performedBy;
    private LocalDateTime performedAt;

    public AuditLog() {}
    public AuditLog(String entityType, Long entityId, String action, String details, Long performedBy) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.details = details;
        this.performedBy = performedBy;
        this.performedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public Long getPerformedBy() { return performedBy; }
    public LocalDateTime getPerformedAt() { return performedAt; }
}
