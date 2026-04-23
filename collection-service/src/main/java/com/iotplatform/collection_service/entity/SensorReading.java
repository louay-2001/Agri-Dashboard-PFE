package com.iotplatform.collection_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.IdClass;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(SensorReadingId.class)
@Table(
        name = "sensor_data",
        indexes = {
                @Index(name = "idx_sensor_data_org_time", columnList = "organization_id, time"),
                @Index(name = "idx_sensor_data_device_time", columnList = "device_id, time")
        }
)
public class SensorReading {

    @jakarta.persistence.Id
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "device_id", nullable = false, updatable = false)
    private UUID deviceId;

    @Column
    private Double temperature;

    @Column
    private Double humidity;

    @Column(name = "soil_moisture")
    private Double soilMoisture;

    @Column(name = "battery_level")
    private Double batteryLevel;

    @Column(name = "mqtt_topic", nullable = false, length = 255, updatable = false)
    private String mqttTopic;

    @Column(name = "raw_payload", nullable = false, columnDefinition = "text", updatable = false)
    private String rawPayload;

    @jakarta.persistence.Id
    @Column(name = "time", nullable = false, updatable = false)
    private Instant recordedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }
}
