package com.assetflow.service;

import com.assetflow.model.*;
import com.assetflow.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AllocationService {
    private final AllocationRepository allocationRepository;
    private final AssetRepository assetRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AllocationService(AllocationRepository allocationRepository, AssetRepository assetRepository,
                             NotificationService notificationService, AuditLogService auditLogService) {
        this.allocationRepository = allocationRepository;
        this.assetRepository = assetRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public Allocation allocate(Long assetId, Long userId) {
        allocationRepository.findByAssetIdAndStatus(assetId, Allocation.Status.ACTIVE)
            .ifPresent(a -> { throw new RuntimeException("Asset already allocated"); });
        Asset asset = assetRepository.findById(assetId).orElseThrow();
        asset.setStatus(Asset.Status.ALLOCATED);
        assetRepository.save(asset);

        Allocation allocation = new Allocation();
        allocation.setAsset(asset);
        User user = new User(); user.setId(userId);
        allocation.setUser(user);
        allocation.setAllocatedDate(LocalDate.now());
        allocation.setStatus(Allocation.Status.ACTIVE);
        Allocation saved = allocationRepository.save(allocation);
        notificationService.create(userId, "Asset '" + asset.getName() + "' has been allocated to you.", "ALLOCATION");
        auditLogService.log("ASSET", assetId, "ALLOCATED", "Allocated to user ID " + userId, userId);
        return saved;
    }

    public Allocation returnAsset(Long allocationId) {
        Allocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        allocation.setStatus(Allocation.Status.RETURNED);
        allocation.setReturnedDate(LocalDate.now());
        Asset asset = allocation.getAsset();
        asset.setStatus(Asset.Status.AVAILABLE);
        assetRepository.save(asset);
        auditLogService.log("ASSET", asset.getId(), "RETURNED", "Returned by user ID " + allocation.getUser().getId(), allocation.getUser().getId());
        return allocationRepository.save(allocation);
    }

    public List<Allocation> getAll() { return allocationRepository.findAll(); }
    public List<Allocation> getByUser(Long userId) { return allocationRepository.findByUserId(userId); }
}
