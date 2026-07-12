package com.assetflow.controller;

import com.assetflow.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController @RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    public BookingController(BookingService bookingService) { this.bookingService = bookingService; }

    @GetMapping public ResponseEntity<?> getAll() { return ResponseEntity.ok(bookingService.getAll()); }
    @GetMapping("/user/{userId}") public ResponseEntity<?> getByUser(@PathVariable Long userId) { return ResponseEntity.ok(bookingService.getByUser(userId)); }

    @PostMapping public ResponseEntity<?> book(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.book(
            Long.parseLong(body.get("assetId")), Long.parseLong(body.get("userId")),
            LocalDate.parse(body.get("startDate")), LocalDate.parse(body.get("endDate"))
        ));
    }

    @PatchMapping("/{id}/cancel") public ResponseEntity<?> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }
}
