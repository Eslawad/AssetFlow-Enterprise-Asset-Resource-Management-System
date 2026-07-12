package com.assetflow.service;

import com.assetflow.model.*;
import com.assetflow.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final AssetRepository assetRepository;
    private final AllocationRepository allocationRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportService(AssetRepository assetRepository, AllocationRepository allocationRepository,
                         BookingRepository bookingRepository, MaintenanceRepository maintenanceRepository,
                         AuditLogRepository auditLogRepository) {
        this.assetRepository = assetRepository;
        this.allocationRepository = allocationRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Map<String, Object> getDashboardStats() {
        List<Asset> assets = assetRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", assets.size());
        stats.put("available", assets.stream().filter(a -> a.getStatus() == Asset.Status.AVAILABLE).count());
        stats.put("allocated", assets.stream().filter(a -> a.getStatus() == Asset.Status.ALLOCATED).count());
        stats.put("underMaintenance", assets.stream().filter(a -> a.getStatus() == Asset.Status.UNDER_MAINTENANCE).count());
        stats.put("byCategory", assets.stream().collect(Collectors.groupingBy(Asset::getCategory, Collectors.counting())));

        // Upcoming bookings (next 7 days)
        List<Map<String, Object>> upcomingBookings = bookingRepository.findAll().stream()
            .filter(b -> b.getStatus() == Booking.Status.ACTIVE &&
                         !b.getEndDate().isBefore(today) && !b.getStartDate().isAfter(nextWeek))
            .map(b -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", b.getId());
                m.put("assetName", b.getAsset().getName());
                m.put("userName", b.getUser().getName());
                m.put("startDate", b.getStartDate());
                m.put("endDate", b.getEndDate());
                return m;
            }).collect(Collectors.toList());
        stats.put("upcomingBookings", upcomingBookings);

        // Upcoming maintenance (next 7 days)
        List<Map<String, Object>> upcomingMaintenance = maintenanceRepository.findAll().stream()
            .filter(m -> m.getStatus() == Maintenance.Status.SCHEDULED &&
                         !m.getScheduledDate().isBefore(today) && !m.getScheduledDate().isAfter(nextWeek))
            .map(m -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", m.getId());
                map.put("assetName", m.getAsset().getName());
                map.put("description", m.getDescription());
                map.put("scheduledDate", m.getScheduledDate());
                return map;
            }).collect(Collectors.toList());
        stats.put("upcomingMaintenance", upcomingMaintenance);

        // Recent activity
        stats.put("recentActivity", auditLogRepository.findTop50ByOrderByPerformedAtDesc().stream()
            .limit(10)
            .map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("action", a.getAction());
                m.put("details", a.getDetails());
                m.put("performedAt", a.getPerformedAt());
                return m;
            }).collect(Collectors.toList()));

        return stats;
    }

    public String exportAssetsCSV() throws IOException {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("ID", "Name", "Category", "Serial", "Status", "Location", "Purchase Date", "Price"))) {
            for (Asset a : assetRepository.findAll()) {
                printer.printRecord(a.getId(), a.getName(), a.getCategory(), a.getSerialNumber(),
                    a.getStatus(), a.getLocation(), a.getPurchaseDate(), a.getPurchasePrice());
            }
        }
        return sw.toString();
    }

    public String exportAllocationsCSV() throws IOException {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("ID", "Asset", "User", "Allocated Date", "Returned Date", "Status"))) {
            for (Allocation a : allocationRepository.findAll()) {
                printer.printRecord(a.getId(), a.getAsset().getName(), a.getUser().getName(),
                    a.getAllocatedDate(), a.getReturnedDate(), a.getStatus());
            }
        }
        return sw.toString();
    }
}
