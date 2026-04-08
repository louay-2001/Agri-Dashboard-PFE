package com.example.service_alerte.model;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsSummary {

    private long gatewaysCount;
    private long nodesCount;
    private long sensorsCount;
    private long activeAlertsCount;
    private long sensorsAboveThresholdCount;
    private long sensorsWithinThresholdCount;
    private List<AnalyticsBreakdownItem> alertsBySensorType = new ArrayList<>();
    private List<AnalyticsBreakdownItem> nodesByGateway = new ArrayList<>();
    private List<AlertData> latestAlerts = new ArrayList<>();

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

    public long getActiveAlertsCount() {
        return activeAlertsCount;
    }

    public void setActiveAlertsCount(long activeAlertsCount) {
        this.activeAlertsCount = activeAlertsCount;
    }

    public long getSensorsAboveThresholdCount() {
        return sensorsAboveThresholdCount;
    }

    public void setSensorsAboveThresholdCount(long sensorsAboveThresholdCount) {
        this.sensorsAboveThresholdCount = sensorsAboveThresholdCount;
    }

    public long getSensorsWithinThresholdCount() {
        return sensorsWithinThresholdCount;
    }

    public void setSensorsWithinThresholdCount(long sensorsWithinThresholdCount) {
        this.sensorsWithinThresholdCount = sensorsWithinThresholdCount;
    }

    public List<AnalyticsBreakdownItem> getAlertsBySensorType() {
        return alertsBySensorType;
    }

    public void setAlertsBySensorType(List<AnalyticsBreakdownItem> alertsBySensorType) {
        this.alertsBySensorType = alertsBySensorType;
    }

    public List<AnalyticsBreakdownItem> getNodesByGateway() {
        return nodesByGateway;
    }

    public void setNodesByGateway(List<AnalyticsBreakdownItem> nodesByGateway) {
        this.nodesByGateway = nodesByGateway;
    }

    public List<AlertData> getLatestAlerts() {
        return latestAlerts;
    }

    public void setLatestAlerts(List<AlertData> latestAlerts) {
        this.latestAlerts = latestAlerts;
    }
}
