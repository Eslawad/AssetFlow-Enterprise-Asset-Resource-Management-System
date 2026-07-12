package com.assetflow.repository;
import com.assetflow.model.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    Optional<Allocation> findByAssetIdAndStatus(Long assetId, Allocation.Status status);
    List<Allocation> findByUserId(Long userId);
    List<Allocation> findByAssetId(Long assetId);
}
