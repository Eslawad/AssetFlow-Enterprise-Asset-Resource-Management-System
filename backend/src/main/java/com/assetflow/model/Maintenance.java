package com.assetflow.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "maintenance")
public class Maintenance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "asset_id") private Asset asset;
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private Double cost;
    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status { SCHEDULED, IN_PROGRESS, COMPLETED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
