package com.example.service_alerte.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

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

    @Transient
    public Long getSensorId() {
        return id;
    }

    public Long getNodeId() {
        return nodeId;
    }

    @Transient
    public NodeRef getNode() {
        return nodeId == null ? null : new NodeRef(nodeId);
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setSensorId(Long sensorId) {
        this.id = sensorId;
    }

    public void setNodeId(Long nodeId) {
        this.nodeId = nodeId;
    }

    public void setNode(NodeRef node) {
        if (node != null) {
            this.nodeId = node.getId();
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setMeasurementType(String measurementType) {
        this.measurementType = measurementType;
    }

    public void setMeasurementUnit(String measurementUnit) {
        this.measurementUnit = measurementUnit;
    }

    public void setMeasurementValue(Double measurementValue) {
        this.measurementValue = measurementValue;
    }

    public void setPrecision(Double precision) {
        this.precision = precision;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
    }

    public void setSensorPrecision(Double sensorPrecision) {
        this.sensorPrecision = sensorPrecision;
    }

    public void setLegacyPrecision(Double legacyPrecision) {
        this.legacyPrecision = legacyPrecision;
    }

    public static class NodeRef {
        private Long id;

        public NodeRef() {
        }

        public NodeRef(Long id) {
            this.id = id;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }
    }
}
