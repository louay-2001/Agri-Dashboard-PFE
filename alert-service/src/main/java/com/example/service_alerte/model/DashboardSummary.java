package com.example.service_alerte.model;

import java.util.ArrayList;
import java.util.List;

public class DashboardSummary {

    private long alertsCount;
    private long gatewaysCount;
    private long nodesCount;
    private long sensorsCount;
    private List<AlertData> alerts = new ArrayList<>();
    private List<DashboardMarker> markers = new ArrayList<>();

    public long getAlertsCount() {
        return alertsCount;
    }

    public void setAlertsCount(long alertsCount) {
        this.alertsCount = alertsCount;
    }

    public long getGatewaysCount() {
        return gatewaysCount;
    }

    public void setGatewaysCount(long gatewaysCount) {
        this.gatewaysCount = gatewaysCount;
    }

    public long getNodesCount() {
        return nodesCount;
    }

    public void setNodesCount(long nodesCount) {
        this.nodesCount = nodesCount;
    }

    public long getSensorsCount() {
        return sensorsCount;
    }

    public void setSensorsCount(long sensorsCount) {
        this.sensorsCount = sensorsCount;
    }

    public List<AlertData> getAlerts() {
        return alerts;
    }

    public void setAlerts(List<AlertData> alerts) {
        this.alerts = alerts;
    }

    public List<DashboardMarker> getMarkers() {
        return markers;
    }

    public void setMarkers(List<DashboardMarker> markers) {
        this.markers = markers;
    }
}
