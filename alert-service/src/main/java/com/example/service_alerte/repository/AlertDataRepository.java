package com.example.service_alerte.repository;

import com.example.service_alerte.model.AlertData;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertDataRepository extends JpaRepository<AlertData, Long> {
    Optional<AlertData> findBySensorId(Long sensorId);
    Optional<AlertData> findFirstBySensorIdAndActiveTrue(Long sensorId);
    List<AlertData> findAllByActiveTrue();
    List<AlertData> findAllByAcknowledgedFalseAndActiveTrueOrderByTimestampDesc();
    List<AlertData> findTop10ByOrderByTimestampDesc();
}
