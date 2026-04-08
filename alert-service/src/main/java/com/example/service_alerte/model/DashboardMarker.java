package com.example.service_alerte.model;

public class DashboardMarker {

    private Long id;
    private String kind;
    private String name;
    private Double latitude;
    private Double longitude;
    private String status;
    private String location;

    public DashboardMarker() {
    }

    public DashboardMarker(Long id, String kind, String name, Double latitude, Double longitude, String status, String location) {
        this.id = id;
        this.kind = kind;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public String getKind() {
        return kind;
    }

    public String getName() {
        return name;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getStatus() {
        return status;
    }

    public String getLocation() {
        return location;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
