package com.example.service_alerte.service;

import com.example.service_alerte.model.AlertData;
import com.example.service_alerte.model.AnalyticsBreakdownItem;
import com.example.service_alerte.model.AnalyticsSummary;
import com.example.service_alerte.model.DashboardMarker;
import com.example.service_alerte.model.DashboardSummary;
import com.example.service_alerte.model.GatewayDevice;
import com.example.service_alerte.model.NodeDevice;
import com.example.service_alerte.model.SensorDevice;
import com.example.service_alerte.repository.AlertDataRepository;
import com.example.service_alerte.repository.GatewayDeviceRepository;
import com.example.service_alerte.repository.NodeDeviceRepository;
import com.example.service_alerte.repository.SensorDeviceRepository;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final AlerteService alerteService;
    private final AlertDataRepository alertDataRepository;
    private final GatewayDeviceRepository gatewayDeviceRepository;
    private final NodeDeviceRepository nodeDeviceRepository;
    private final SensorDeviceRepository sensorDeviceRepository;

    public DashboardService(
            AlerteService alerteService,
            AlertDataRepository alertDataRepository,
            GatewayDeviceRepository gatewayDeviceRepository,
            NodeDeviceRepository nodeDeviceRepository,
            SensorDeviceRepository sensorDeviceRepository
    ) {
        this.alerteService = alerteService;
        this.alertDataRepository = alertDataRepository;
        this.gatewayDeviceRepository = gatewayDeviceRepository;
        this.nodeDeviceRepository = nodeDeviceRepository;
        this.sensorDeviceRepository = sensorDeviceRepository;
    }

    public DashboardSummary getSummary() {
        List<AlertData> activeAlerts = alerteService.getAllAlerts();
        List<GatewayDevice> gateways = gatewayDeviceRepository.findAll();
        List<NodeDevice> nodes = nodeDeviceRepository.findAll();
        List<SensorDevice> sensors = sensorDeviceRepository.findAll();

        Set<Long> alertedSensorIds = activeAlerts.stream()
                .map(AlertData::getSensorId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        Set<Long> warnedNodeIds = sensors.stream()
                .filter(sensor -> sensor.getId() != null && alertedSensorIds.contains(sensor.getId()))
                .map(SensorDevice::getNodeId)
                .filter(nodeId -> nodeId != null)
                .collect(Collectors.toSet());

        Set<Long> warnedGatewayIds = new HashSet<>();
        for (NodeDevice node : nodes) {
            if (node.getId() != null && warnedNodeIds.contains(node.getId()) && node.getGatewayId() != null) {
                warnedGatewayIds.add(node.getGatewayId());
            }
        }

        DashboardSummary summary = new DashboardSummary();
        summary.setAlertsCount(activeAlerts.size());
        summary.setGatewaysCount(gateways.size());
        summary.setNodesCount(nodes.size());
        summary.setSensorsCount(sensors.size());
        summary.setAlerts(activeAlerts);
        summary.setMarkers(buildMarkers(gateways, nodes, warnedGatewayIds, warnedNodeIds));
        return summary;
    }

    public AnalyticsSummary getAnalyticsSummary() {
        List<AlertData> activeAlerts = alerteService.getAllAlerts();
        List<AlertData> latestAlerts = alertDataRepository.findTop10ByOrderByTimestampDesc();
        List<GatewayDevice> gateways = gatewayDeviceRepository.findAll();
        List<NodeDevice> nodes = nodeDeviceRepository.findAll();
        List<SensorDevice> sensors = sensorDeviceRepository.findAll();
        Set<Long> activeAlertSensorIds = activeAlerts.stream()
                .map(AlertData::getSensorId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        long sensorsAboveThresholdCount = sensors.stream()
                .filter(this::isSensorAboveThreshold)
                .count();

        long sensorsWithinThresholdCount = sensors.size() - sensorsAboveThresholdCount;

        Map<String, Long> alertsByType = sensors.stream()
                .filter(sensor -> sensor.getId() != null && activeAlertSensorIds.contains(sensor.getId()))
                .collect(Collectors.groupingBy(this::resolveSensorType, Collectors.counting()));

        Map<Long, Long> nodesCountByGatewayId = nodes.stream()
                .filter(node -> node.getGatewayId() != null)
                .collect(Collectors.groupingBy(NodeDevice::getGatewayId, Collectors.counting()));

        Map<Long, String> gatewayNames = gateways.stream()
                .collect(Collectors.toMap(GatewayDevice::getId, gateway -> resolveName(gateway.getName(), "Gateway", gateway.getId())));

        AnalyticsSummary summary = new AnalyticsSummary();
        summary.setGatewaysCount(gateways.size());
        summary.setNodesCount(nodes.size());
        summary.setSensorsCount(sensors.size());
        summary.setActiveAlertsCount(activeAlerts.size());
        summary.setSensorsAboveThresholdCount(sensorsAboveThresholdCount);
        summary.setSensorsWithinThresholdCount(sensorsWithinThresholdCount);
        summary.setAlertsBySensorType(toBreakdownList(alertsByType));
        summary.setNodesByGateway(
                nodesCountByGatewayId.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(entry -> new AnalyticsBreakdownItem(
                                gatewayNames.getOrDefault(entry.getKey(), "Gateway " + entry.getKey()),
                                entry.getValue()
                        ))
                        .toList()
        );
        summary.setLatestAlerts(latestAlerts);
        return summary;
    }

    private List<DashboardMarker> buildMarkers(
            List<GatewayDevice> gateways,
            List<NodeDevice> nodes,
            Set<Long> warnedGatewayIds,
            Set<Long> warnedNodeIds
    ) {
        List<DashboardMarker> gatewayMarkers = gateways.stream()
                .filter(gateway -> gateway.getLatitude() != null && gateway.getLongitude() != null)
                .map(gateway -> new DashboardMarker(
                        gateway.getId(),
                        "gateway",
                        resolveName(gateway.getName(), "Gateway", gateway.getId()),
                        gateway.getLatitude(),
                        gateway.getLongitude(),
                        warnedGatewayIds.contains(gateway.getId()) ? "Warning" : "Online",
                        gateway.getAddressOrLocation()
                ))
                .toList();

        List<DashboardMarker> nodeMarkers = nodes.stream()
                .filter(node -> node.getLatitude() != null && node.getLongitude() != null)
                .map(node -> new DashboardMarker(
                        node.getId(),
                        "node",
                        resolveName(node.getName(), "Node", node.getId()),
                        node.getLatitude(),
                        node.getLongitude(),
                        warnedNodeIds.contains(node.getId()) ? "Warning" : "Online",
                        node.getAddressOrLocation()
                ))
                .toList();

        List<DashboardMarker> markers = new java.util.ArrayList<>(gatewayMarkers);
        markers.addAll(nodeMarkers);
        return markers;
    }

    private String resolveName(String value, String fallbackPrefix, Long id) {
        if (value != null && !value.trim().isEmpty()) {
            return value;
        }
        return fallbackPrefix + " " + id;
    }

    private boolean isSensorAboveThreshold(SensorDevice sensor) {
        return sensor.getMeasurementValue() != null
                && sensor.getThreshold() != null
                && sensor.getMeasurementValue() > sensor.getThreshold();
    }

    private String resolveSensorType(SensorDevice sensor) {
        if (sensor.getMeasurementType() != null && !sensor.getMeasurementType().trim().isEmpty()) {
            return sensor.getMeasurementType();
        }
        if (sensor.getType() != null && !sensor.getType().trim().isEmpty()) {
            return sensor.getType();
        }
        return "Unknown";
    }

    private List<AnalyticsBreakdownItem> toBreakdownList(Map<String, Long> values) {
        return values.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .map(entry -> new AnalyticsBreakdownItem(entry.getKey(), entry.getValue()))
                .toList();
    }
}
