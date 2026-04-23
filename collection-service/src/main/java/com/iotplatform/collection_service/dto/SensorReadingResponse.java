package com.iotplatform.collection_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorReadingResponse {

    private UUID id;
    private UUID organizationId;
    private UUID deviceId;
    private Double temperature;
    private Double humidity;
    private Double soilMoisture;
    private Double batteryLevel;
    private Instant recordedAt;
    private String mqttTopic;
}
