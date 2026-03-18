package com.example.service_alerte.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "alerts")
public class AlertData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private float value;
    private Instant timestamp;
    private String description;
    private float threshold;
    private String device; // ✅ Nouveau champ pour le nom du capteur

    public AlertData() {}

    public AlertData(String type, float value, Instant timestamp, String description, float threshold, String device) {
        this.type = type;
        this.value = value;
        this.timestamp = timestamp;
        this.description = description;
        this.threshold = threshold;
        this.device = device;
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public float getValue() {
        return value;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getDescription() {
        return description;
    }

    public float getThreshold() {
        return threshold;
    }

    public String getDevice() {
        return device;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setValue(float value) {
        this.value = value;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setThreshold(float threshold) {
        this.threshold = threshold;
    }

    public void setDevice(String device) {
        this.device = device;
    }
}
