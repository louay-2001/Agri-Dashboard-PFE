package com.iotplatform.collection_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iotplatform.collection_service.client.DeviceServiceClient;
import com.iotplatform.collection_service.dto.DeviceLookupResponse;
import com.iotplatform.collection_service.dto.SensorPayloadRequest;
import com.iotplatform.collection_service.entity.SensorReading;
import com.iotplatform.collection_service.exception.InvalidMqttMessageException;
import com.iotplatform.collection_service.repository.SensorReadingRepository;
import com.iotplatform.collection_service.service.SensorReadingIngestionService;
import com.iotplatform.collection_service.util.MqttTopicIdentifiers;
import com.iotplatform.collection_service.util.MqttTopicParser;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SensorReadingIngestionServiceImpl implements SensorReadingIngestionService {

    private final SensorReadingRepository sensorReadingRepository;
    private final DeviceServiceClient deviceServiceClient;
    private final MqttTopicParser mqttTopicParser;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @Override
    @Transactional
    public void ingest(String topic, String payload) {
        MqttTopicIdentifiers identifiers = mqttTopicParser.parse(topic);
        SensorPayloadRequest sensorPayload = parsePayload(payload);
        validatePayload(sensorPayload);

        DeviceLookupResponse device = deviceServiceClient.getDevice(identifiers.organizationId(), identifiers.deviceId());
        if (!identifiers.organizationId().equals(device.getOrganizationId())
                || !identifiers.deviceId().equals(device.getId())) {
            throw new InvalidMqttMessageException("MQTT topic organizationId/deviceId does not match the registered device");
        }

        SensorReading sensorReading = new SensorReading();
        sensorReading.setOrganizationId(identifiers.organizationId());
        sensorReading.setDeviceId(identifiers.deviceId());
        sensorReading.setTemperature(sensorPayload.getTemperature());
        sensorReading.setHumidity(sensorPayload.getHumidity());
        sensorReading.setSoilMoisture(sensorPayload.getSoilMoisture());
        sensorReading.setBatteryLevel(sensorPayload.getBatteryLevel());
        sensorReading.setMqttTopic(topic);
        sensorReading.setRawPayload(payload);

        sensorReadingRepository.save(sensorReading);
    }

    private SensorPayloadRequest parsePayload(String payload) {
        if (payload == null || payload.isBlank()) {
            throw new InvalidMqttMessageException("MQTT payload must not be empty");
        }

        try {
            return objectMapper.readValue(payload, SensorPayloadRequest.class);
        } catch (JsonProcessingException exception) {
            throw new InvalidMqttMessageException("MQTT payload must be valid JSON");
        }
    }

    private void validatePayload(SensorPayloadRequest payload) {
        Set<ConstraintViolation<SensorPayloadRequest>> violations = validator.validate(payload);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .sorted()
                    .reduce((first, second) -> first + ", " + second)
                    .orElse("MQTT payload validation failed");
            throw new InvalidMqttMessageException(message);
        }

        boolean hasMeasurement = payload.getTemperature() != null
                || payload.getHumidity() != null
                || payload.getSoilMoisture() != null
                || payload.getBatteryLevel() != null;

        if (!hasMeasurement) {
            throw new InvalidMqttMessageException("MQTT payload must include at least one sensor measurement");
        }
    }
}
