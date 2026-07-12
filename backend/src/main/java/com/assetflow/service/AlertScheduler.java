package com.assetflow.service;

import com.assetflow.model.*;
import com.assetflow.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AlertScheduler {
    private final MaintenanceRepository maintenanceRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public AlertScheduler(MaintenanceRepository maintenanceRepository, BookingRepository bookingRepository, NotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkMaintenanceDue() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Maintenance> due = maintenanceRepository.findByStatusAndScheduledDateBefore(Maintenance.Status.SCHEDULED, tomorrow.plusDays(1));
        due.forEach(m -> notificationService.create(
            m.getAsset().getId(),
            "Maintenance due for asset '" + m.getAsset().getName() + "' on " + m.getScheduledDate(),
            "MAINTENANCE_DUE"
        ));
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkBookingExpiry() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Booking> expiring = bookingRepository.findByStatusAndEndDateBefore(Booking.Status.ACTIVE, tomorrow.plusDays(1));
        expiring.forEach(b -> notificationService.create(
            b.getUser().getId(),
            "Your booking for '" + b.getAsset().getName() + "' expires on " + b.getEndDate(),
            "BOOKING_EXPIRY"
        ));
    }
}
