package com.assetflow.controller;

import com.assetflow.model.Asset;
import com.assetflow.model.User;
import com.assetflow.service.AssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;
    public AssetController(AssetService assetService) { this.assetService = assetService; }

    @GetMapping public ResponseEntity<?> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(assetService.search(name, category, status, page, size));
    }

    @GetMapping("/{id}") public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getById(id));
    }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> create(@RequestBody Asset asset, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assetService.create(asset, user.getId()));
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Asset asset, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assetService.update(id, asset, user.getId()));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        assetService.delete(id, user.getId()); return ResponseEntity.ok().build();
    }
}
