package com.assetflow.service;

import com.assetflow.model.Asset;
import com.assetflow.repository.AssetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetService {
    private final AssetRepository assetRepository;
    private final AuditLogService auditLogService;

    public AssetService(AssetRepository assetRepository, AuditLogService auditLogService) {
        this.assetRepository = assetRepository;
        this.auditLogService = auditLogService;
    }

    public Asset create(Asset asset, Long userId) {
        assetRepository.findBySerialNumber(asset.getSerialNumber())
            .ifPresent(a -> { throw new RuntimeException("Serial number already exists"); });
        asset.setStatus(Asset.Status.AVAILABLE);
        Asset saved = assetRepository.save(asset);
        auditLogService.log("ASSET", saved.getId(), "CREATED", "Asset '" + saved.getName() + "' registered", userId);
        return saved;
    }

    public List<Asset> getAll() { return assetRepository.findAll(); }

    public Page<Asset> search(String name, String category, String status, int page, int size) {
        return assetRepository.searchAssets(
            (name == null || name.isBlank()) ? null : name,
            (category == null || category.isBlank()) ? null : category,
            (status == null || status.isBlank()) ? null : status,
            PageRequest.of(page, size, Sort.by("name").ascending()));
    }

    public Asset getById(Long id) { return assetRepository.findById(id).orElseThrow(); }

    public Asset update(Long id, Asset updated, Long userId) {
        Asset asset = getById(id);
        String details = "Updated: name=" + updated.getName() + ", status=" + updated.getStatus();
        asset.setName(updated.getName()); asset.setCategory(updated.getCategory());
        asset.setLocation(updated.getLocation()); asset.setStatus(updated.getStatus());
        Asset saved = assetRepository.save(asset);
        auditLogService.log("ASSET", id, "UPDATED", details, userId);
        return saved;
    }

    public void delete(Long id, Long userId) {
        Asset asset = getById(id);
        auditLogService.log("ASSET", id, "DELETED", "Asset '" + asset.getName() + "' deleted", userId);
        assetRepository.deleteById(id);
    }
}
