package com.example.service_alerte.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "nodes")
public class NodeDevice {

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

    @Column(name = "gateway_id")
    private Long gatewayId;

    public Long getId() {
        return id;
    }

    @Transient
    public Long getNodeId() {
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

    public Long getGatewayId() {
        return gatewayId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNodeId(Long nodeId) {
        this.id = nodeId;
    }

    public void setAddressOrLocation(String addressOrLocation) {
        this.addressOrLocation = addressOrLocation;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setMacAddress(String macAddress) {
        this.macAddress = macAddress;
    }

    public void setMarkOrModel(String markOrModel) {
        this.markOrModel = markOrModel;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setGatewayId(Long gatewayId) {
        this.gatewayId = gatewayId;
    }
}
