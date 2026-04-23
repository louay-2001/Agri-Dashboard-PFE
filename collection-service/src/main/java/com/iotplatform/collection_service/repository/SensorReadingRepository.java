package com.iotplatform.collection_service.repository;

import com.iotplatform.collection_service.entity.SensorReading;
import com.iotplatform.collection_service.entity.SensorReadingId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SensorReadingRepository extends JpaRepository<SensorReading, SensorReadingId> {

    Page<SensorReading> findByOrganizationIdOrderByRecordedAtDesc(UUID organizationId, Pageable pageable);

    Page<SensorReading> findByOrganizationIdAndDeviceIdOrderByRecordedAtDesc(UUID organizationId,
                                                                             UUID deviceId,
                                                                             Pageable pageable);

    Optional<SensorReading> findFirstByOrganizationIdAndDeviceIdOrderByRecordedAtDesc(UUID organizationId, UUID deviceId);
}
