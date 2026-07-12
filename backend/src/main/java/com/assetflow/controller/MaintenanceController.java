package com.assetflow.controller;

import com.assetflow.model.Maintenance;
import com.assetflow.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/maintenance")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;
    public MaintenanceController(MaintenanceService maintenanceService) { this.maintenanceService = maintenanceService; }

    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(maintenanceService.getAll()); }
    @GetMapping("/asset/{assetId}") public ResponseEntity<?> getByAsset(@PathVariable Long assetId) { return ResponseEntity.ok(maintenanceService.getByAsset(assetId)); }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> schedule(@RequestBody Maintenance maintenance) { return ResponseEntity.ok(maintenanceService.schedule(maintenance)); }

    @PatchMapping("/{id}/complete") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> complete(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(maintenanceService.complete(id, body.get("cost")));
    }
}
