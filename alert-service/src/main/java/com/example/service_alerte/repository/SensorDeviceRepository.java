package com.example.service_alerte.repository;

import com.example.service_alerte.model.SensorDevice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SensorDeviceRepository extends JpaRepository<SensorDevice, Long> {
    Optional<SensorDevice> findTopByOrderByIdDesc();
}
