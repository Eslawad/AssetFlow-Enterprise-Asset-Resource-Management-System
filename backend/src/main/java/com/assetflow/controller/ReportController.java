package com.assetflow.controller;

import com.assetflow.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;
    public ReportController(ReportService reportService) { this.reportService = reportService; }

    @GetMapping("/stats") public ResponseEntity<?> getStats() { return ResponseEntity.ok(reportService.getDashboardStats()); }

    @GetMapping("/export/assets") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<byte[]> exportAssets() throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(reportService.exportAssetsCSV().getBytes());
    }

    @GetMapping("/export/allocations") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<byte[]> exportAllocations() throws Exception {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=allocations.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(reportService.exportAllocationsCSV().getBytes());
    }
}
