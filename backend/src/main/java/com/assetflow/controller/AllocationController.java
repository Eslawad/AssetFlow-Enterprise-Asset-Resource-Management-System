package com.assetflow.controller;

import com.assetflow.service.AllocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/allocations")
public class AllocationController {
    private final AllocationService allocationService;
    public AllocationController(AllocationService allocationService) { this.allocationService = allocationService; }

    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(allocationService.getAll()); }
    @GetMapping("/user/{userId}") public ResponseEntity<?> getByUser(@PathVariable Long userId) { return ResponseEntity.ok(allocationService.getByUser(userId)); }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> allocate(@RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(allocationService.allocate(body.get("assetId"), body.get("userId")));
    }

    @PatchMapping("/{id}/return") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> returnAsset(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.returnAsset(id));
    }
}
