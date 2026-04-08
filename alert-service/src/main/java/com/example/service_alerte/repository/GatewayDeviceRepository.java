package com.example.service_alerte.repository;

import com.example.service_alerte.model.GatewayDevice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GatewayDeviceRepository extends JpaRepository<GatewayDevice, Long> {
    Optional<GatewayDevice> findTopByOrderByIdDesc();
}
