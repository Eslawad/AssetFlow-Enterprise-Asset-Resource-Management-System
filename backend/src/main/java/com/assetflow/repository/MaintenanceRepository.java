package com.assetflow.repository;
import com.assetflow.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByAssetId(Long assetId);
    List<Maintenance> findByStatusAndScheduledDateBefore(Maintenance.Status status, LocalDate date);
}
