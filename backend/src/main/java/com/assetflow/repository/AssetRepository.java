package com.assetflow.repository;

import com.assetflow.model.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySerialNumber(String serialNumber);

    @Query("SELECT a FROM Asset a WHERE " +
           "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:category IS NULL OR LOWER(a.category) = LOWER(:category)) AND " +
           "(:status IS NULL OR CAST(a.status AS string) = :status)")
    Page<Asset> searchAssets(@Param("name") String name, @Param("category") String category,
                             @Param("status") String status, Pageable pageable);
}
