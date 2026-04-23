package com.iotplatform.collection_service.service.impl;

import com.iotplatform.collection_service.dto.SensorReadingResponse;
import com.iotplatform.collection_service.entity.SensorReading;
import com.iotplatform.collection_service.exception.ResourceNotFoundException;
import com.iotplatform.collection_service.repository.SensorReadingRepository;
import com.iotplatform.collection_service.service.SensorReadingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SensorReadingQueryServiceImpl implements SensorReadingQueryService {

    private final SensorReadingRepository sensorReadingRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SensorReadingResponse> getReadings(UUID organizationId, UUID deviceId, Pageable pageable) {
        Page<SensorReading> readings = deviceId == null
                ? sensorReadingRepository.findByOrganizationIdOrderByRecordedAtDesc(organizationId, pageable)
                : sensorReadingRepository.findByOrganizationIdAndDeviceIdOrderByRecordedAtDesc(organizationId, deviceId, pageable);

        return readings.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SensorReadingResponse getLatestReading(UUID organizationId, UUID deviceId) {
        SensorReading reading = sensorReadingRepository
                .findFirstByOrganizationIdAndDeviceIdOrderByRecordedAtDesc(organizationId, deviceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No sensor readings were found for device %s in organization %s".formatted(deviceId, organizationId)
                ));

        return toResponse(reading);
    }

    private SensorReadingResponse toResponse(SensorReading sensorReading) {
        return SensorReadingResponse.builder()
                .id(sensorReading.getId())
                .organizationId(sensorReading.getOrganizationId())
                .deviceId(sensorReading.getDeviceId())
                .temperature(sensorReading.getTemperature())
                .humidity(sensorReading.getHumidity())
                .soilMoisture(sensorReading.getSoilMoisture())
                .batteryLevel(sensorReading.getBatteryLevel())
                .recordedAt(sensorReading.getRecordedAt())
                .mqttTopic(sensorReading.getMqttTopic())
                .build();
    }
}
