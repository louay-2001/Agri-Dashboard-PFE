package com.iotplatform.collection_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class SensorReadingId implements Serializable {

    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "time", nullable = false, updatable = false)
    private Instant recordedAt;
}
