package com.assetflow.service;

import com.assetflow.model.*;
import com.assetflow.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, AssetRepository assetRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.assetRepository = assetRepository;
        this.notificationService = notificationService;
    }

    public Booking book(Long assetId, Long userId, LocalDate start, LocalDate end) {
        List<Booking> overlaps = bookingRepository.findOverlapping(assetId, start, end);
        if (!overlaps.isEmpty()) throw new RuntimeException("Booking overlaps with existing booking");

        Booking booking = new Booking();
        Asset asset = assetRepository.findById(assetId).orElseThrow();
        booking.setAsset(asset);
        User user = new User(); user.setId(userId);
        booking.setUser(user);
        booking.setStartDate(start); booking.setEndDate(end);
        booking.setStatus(Booking.Status.ACTIVE);
        Booking saved = bookingRepository.save(booking);
        notificationService.create(userId, "Booking confirmed for '" + asset.getName() + "' from " + start + " to " + end, "BOOKING");
        return saved;
    }

    public Booking cancel(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(Booking.Status.CANCELLED);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAll() { return bookingRepository.findAll(); }
    public List<Booking> getByUser(Long userId) { return bookingRepository.findByUserId(userId); }
}
