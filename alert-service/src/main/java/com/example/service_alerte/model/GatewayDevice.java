package com.example.service_alerte.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "gateway")
public class GatewayDevice {

    @Id
    private Long id;

    @Column(name = "address_or_location")
    private String addressOrLocation;

    @Column(name = "ip_address")
    private String ipAddress;

    private Double latitude;

    private Double longitude;

    @Column(name = "mac_address")
    private String macAddress;

    @Column(name = "mark_or_model")
    private String markOrModel;

    private String name;

    public Long getId() {
        return id;
    }

    public String getAddressOrLocation() {
        return addressOrLocation;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getMacAddress() {
        return macAddress;
    }

    public String getMarkOrModel() {
        return markOrModel;
    }

    public String getName() {
        return name;
    }
}
