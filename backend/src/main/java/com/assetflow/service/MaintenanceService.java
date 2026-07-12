package com.assetflow.service;

import com.assetflow.model.*;
import com.assetflow.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository, AssetRepository assetRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
    }

    public Maintenance schedule(Maintenance maintenance) {
        Asset asset = assetRepository.findById(maintenance.getAsset().getId()).orElseThrow();
        asset.setStatus(Asset.Status.UNDER_MAINTENANCE);
        assetRepository.save(asset);
        maintenance.setStatus(Maintenance.Status.SCHEDULED);
        return maintenanceRepository.save(maintenance);
    }

    public Maintenance complete(Long id, Double cost) {
        Maintenance m = maintenanceRepository.findById(id).orElseThrow();
        m.setStatus(Maintenance.Status.COMPLETED);
        m.setCompletedDate(LocalDate.now());
        m.setCost(cost);
        Asset asset = m.getAsset();
        asset.setStatus(Asset.Status.AVAILABLE);
        assetRepository.save(asset);
        return maintenanceRepository.save(m);
    }

    public List<Maintenance> getAll() { return maintenanceRepository.findAll(); }
    public List<Maintenance> getByAsset(Long assetId) { return maintenanceRepository.findByAssetId(assetId); }
}
