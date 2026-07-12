package com.assetflow.repository;
import com.assetflow.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.asset.id = :assetId AND b.status = 'ACTIVE' AND b.startDate <= :end AND b.endDate >= :start")
    List<Booking> findOverlapping(Long assetId, LocalDate start, LocalDate end);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByStatusAndEndDateBefore(Booking.Status status, LocalDate date);
}
