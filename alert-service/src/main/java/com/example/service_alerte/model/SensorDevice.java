package com.example.service_alerte.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sensors")
public class SensorDevice {

    @Id
    private Long id;

    @Column(name = "node_id")
    private Long nodeId;

    private String name;

    private String type;

    @Column(name = "measurement_type")
    private String measurementType;

    @Column(name = "measurement_unit")
    private String measurementUnit;

    @Column(name = "measurement_value")
    private Double measurementValue;

    private Double precision;

    private Double threshold;

    @Column(name = "sensor_precision")
    private Double sensorPrecision;

    @Column(name = "_precision")
    private Double legacyPrecision;

    public Long getId() {
        return id;
    }

    public Long getNodeId() {
        return nodeId;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getMeasurementType() {
        return measurementType;
    }

    public String getMeasurementUnit() {
        return measurementUnit;
    }

    public Double getMeasurementValue() {
        return measurementValue;
    }

    public Double getPrecision() {
        return precision;
    }

    public Double getThreshold() {
        return threshold;
    }

    public Double getSensorPrecision() {
        return sensorPrecision;
    }

    public Double getLegacyPrecision() {
        return legacyPrecision;
    }
}
