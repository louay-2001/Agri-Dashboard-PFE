package com.iotplatform.device_service.repository;

import com.iotplatform.device_service.entity.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    Page<Device> findByOrganizationId(UUID organizationId, Pageable pageable);

    Optional<Device> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByDeviceIdentifier(String deviceIdentifier);
}
