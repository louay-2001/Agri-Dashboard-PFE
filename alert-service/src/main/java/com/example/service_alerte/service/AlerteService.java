package com.example.service_alerte.service;

import com.example.service_alerte.model.AlertData;
import com.example.service_alerte.model.SensorDevice;
import com.example.service_alerte.repository.AlertDataRepository;
import com.example.service_alerte.repository.SensorDeviceRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlerteService {

    private final AlertDataRepository alertDataRepository;
    private final SensorDeviceRepository sensorDeviceRepository;

    public AlerteService(
            AlertDataRepository alertDataRepository,
            SensorDeviceRepository sensorDeviceRepository
    ) {
        this.alertDataRepository = alertDataRepository;
        this.sensorDeviceRepository = sensorDeviceRepository;
    }

    public List<AlertData> verifierDonnees(float temp, float gaz) {
        return getAllAlerts();
    }

    public List<AlertData> getAllAlerts() {
        synchronizeAlertsFromSensors();
        return alertDataRepository.findAllByAcknowledgedFalseAndActiveTrueOrderByTimestampDesc();
    }

    public AlertData acknowledgeAlert(Long alertId) {
        AlertData alert = alertDataRepository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        alert.setAcknowledged(true);
        return alertDataRepository.save(alert);
    }

    private void synchronizeAlertsFromSensors() {
        List<SensorDevice> sensors = sensorDeviceRepository.findAll();
        List<AlertData> existingActiveAlerts = alertDataRepository.findAllByActiveTrue();
        Set<Long> triggeredSensorIds = new HashSet<>();
        List<AlertData> alertsToSave = new ArrayList<>();
        Instant now = Instant.now();

        for (SensorDevice sensor : sensors) {
            if (!isTriggered(sensor) || sensor.getId() == null) {
                continue;
            }

            triggeredSensorIds.add(sensor.getId());

            AlertData alert = alertDataRepository.findFirstBySensorIdAndActiveTrue(sensor.getId())
                    .orElseGet(AlertData::new);

            alert.setSensorId(sensor.getId());
            alert.setType(resolveAlertType(sensor));
            alert.setValue(sensor.getMeasurementValue().floatValue());
            alert.setThreshold(sensor.getThreshold().floatValue());
            alert.setTimestamp(now);
            alert.setDevice(resolveDeviceName(sensor));
            alert.setDescription(buildDescription(sensor));
            alert.setActive(true);

            if (alert.getId() == null) {
                alert.setAcknowledged(false);
            }

            alertsToSave.add(alert);
        }

        for (AlertData existingAlert : existingActiveAlerts) {
            Long sensorId = existingAlert.getSensorId();
            if (sensorId == null || !triggeredSensorIds.contains(sensorId)) {
                existingAlert.setActive(false);
                alertsToSave.add(existingAlert);
            }
        }

        if (!alertsToSave.isEmpty()) {
            alertDataRepository.saveAll(alertsToSave);
        }
    }

    private boolean isTriggered(SensorDevice sensor) {
        return sensor.getMeasurementValue() != null
                && sensor.getThreshold() != null
                && sensor.getMeasurementValue() > sensor.getThreshold();
    }

    private String resolveAlertType(SensorDevice sensor) {
        if (hasText(sensor.getMeasurementType())) {
            return sensor.getMeasurementType();
        }
        if (hasText(sensor.getType())) {
            return sensor.getType();
        }
        return "sensor";
    }

    private String resolveDeviceName(SensorDevice sensor) {
        if (hasText(sensor.getName())) {
            return sensor.getName();
        }
        return "Sensor " + sensor.getId();
    }

    private String buildDescription(SensorDevice sensor) {
        return resolveDeviceName(sensor)
                + " exceeded threshold: "
                + sensor.getMeasurementValue()
                + " > "
                + sensor.getThreshold();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
