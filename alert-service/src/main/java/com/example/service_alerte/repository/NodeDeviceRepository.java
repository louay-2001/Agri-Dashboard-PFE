package com.example.service_alerte.repository;

import com.example.service_alerte.model.NodeDevice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NodeDeviceRepository extends JpaRepository<NodeDevice, Long> {
    Optional<NodeDevice> findTopByOrderByIdDesc();
}
