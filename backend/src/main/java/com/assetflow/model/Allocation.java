package com.assetflow.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "allocations")
public class Allocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "asset_id") private Asset asset;
    @ManyToOne @JoinColumn(name = "user_id") private User user;
    private LocalDate allocatedDate;
    private LocalDate returnedDate;
    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status { ACTIVE, RETURNED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getAllocatedDate() { return allocatedDate; }
    public void setAllocatedDate(LocalDate allocatedDate) { this.allocatedDate = allocatedDate; }
    public LocalDate getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDate returnedDate) { this.returnedDate = returnedDate; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
