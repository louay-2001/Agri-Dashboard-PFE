package com.example.service_alerte.controller;

import com.example.service_alerte.model.GatewayDevice;
import com.example.service_alerte.model.NodeDevice;
import com.example.service_alerte.model.SensorDevice;
import com.example.service_alerte.repository.GatewayDeviceRepository;
import com.example.service_alerte.repository.NodeDeviceRepository;
import com.example.service_alerte.repository.SensorDeviceRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
public class InventoryController {

    private final GatewayDeviceRepository gatewayDeviceRepository;
    private final NodeDeviceRepository nodeDeviceRepository;
    private final SensorDeviceRepository sensorDeviceRepository;

    public InventoryController(
            GatewayDeviceRepository gatewayDeviceRepository,
            NodeDeviceRepository nodeDeviceRepository,
            SensorDeviceRepository sensorDeviceRepository
    ) {
        this.gatewayDeviceRepository = gatewayDeviceRepository;
        this.nodeDeviceRepository = nodeDeviceRepository;
        this.sensorDeviceRepository = sensorDeviceRepository;
    }

    @GetMapping("/gateways")
    public List<GatewayDevice> getAllGateways() {
        return gatewayDeviceRepository.findAll();
    }

    @GetMapping("/gateways/{id}")
    public ResponseEntity<GatewayDevice> getGatewayById(@PathVariable Long id) {
        return ResponseEntity.of(gatewayDeviceRepository.findById(id));
    }

    @PostMapping("/gateways")
    public ResponseEntity<GatewayDevice> createGateway(@RequestBody Map<String, Object> payload) {
        Long requestedId = extractId(payload, "id", "gatewayId");
        GatewayDevice gateway = requestedId == null
                ? new GatewayDevice()
                : gatewayDeviceRepository.findById(requestedId).orElseGet(GatewayDevice::new);

        if (gateway.getId() == null) {
            gateway.setId(resolveCreateId(requestedId, gatewayDeviceRepository.findTopByOrderByIdDesc().map(GatewayDevice::getId).orElse(0L)));
        }

        applyGatewayPayload(gateway, payload);
        return ResponseEntity.ok(gatewayDeviceRepository.save(gateway));
    }

    @PutMapping("/gateways/{id}")
    public ResponseEntity<GatewayDevice> updateGateway(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        GatewayDevice gateway = gatewayDeviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gateway not found"));

        gateway.setId(id);
        applyGatewayPayload(gateway, payload);
        return ResponseEntity.ok(gatewayDeviceRepository.save(gateway));
    }

    @DeleteMapping("/gateways/{id}")
    public ResponseEntity<Void> deleteGateway(@PathVariable Long id) {
        if (!gatewayDeviceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gateway not found");
        }

        gatewayDeviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nodes")
    public List<NodeDevice> getAllNodes() {
        return nodeDeviceRepository.findAll();
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<NodeDevice> getNodeById(@PathVariable Long id) {
        return ResponseEntity.of(nodeDeviceRepository.findById(id));
    }

    @PostMapping("/nodes")
    public ResponseEntity<NodeDevice> createNode(@RequestBody Map<String, Object> payload) {
        Long requestedId = extractId(payload, "id", "nodeId");
        NodeDevice node = requestedId == null
                ? new NodeDevice()
                : nodeDeviceRepository.findById(requestedId).orElseGet(NodeDevice::new);

        if (node.getId() == null) {
            node.setId(resolveCreateId(requestedId, nodeDeviceRepository.findTopByOrderByIdDesc().map(NodeDevice::getId).orElse(0L)));
        }

        applyNodePayload(node, payload);
        ensureGatewayExists(node.getGatewayId());
        return ResponseEntity.ok(nodeDeviceRepository.save(node));
    }

    @PutMapping("/nodes/{id}")
    public ResponseEntity<NodeDevice> updateNode(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        NodeDevice node = nodeDeviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found"));

        node.setId(id);
        applyNodePayload(node, payload);
        ensureGatewayExists(node.getGatewayId());
        return ResponseEntity.ok(nodeDeviceRepository.save(node));
    }

    @DeleteMapping("/nodes/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable Long id) {
        if (!nodeDeviceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found");
        }

        nodeDeviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sensors")
    public List<SensorDevice> getAllSensors() {
        return sensorDeviceRepository.findAll();
    }

    @GetMapping("/sensors/{id}")
    public ResponseEntity<SensorDevice> getSensorById(@PathVariable Long id) {
        return ResponseEntity.of(sensorDeviceRepository.findById(id));
    }

    @PostMapping("/sensors")
    public ResponseEntity<SensorDevice> createSensor(@RequestBody Map<String, Object> payload) {
        Long requestedId = extractId(payload, "id", "sensorId");
        SensorDevice sensor = requestedId == null
                ? new SensorDevice()
                : sensorDeviceRepository.findById(requestedId).orElseGet(SensorDevice::new);

        if (sensor.getId() == null) {
            sensor.setId(resolveCreateId(requestedId, sensorDeviceRepository.findTopByOrderByIdDesc().map(SensorDevice::getId).orElse(0L)));
        }

        applySensorPayload(sensor, payload);
        ensureNodeExists(sensor.getNodeId());
        return ResponseEntity.ok(sensorDeviceRepository.save(sensor));
    }

    @PutMapping("/sensors/{id}")
    public ResponseEntity<SensorDevice> updateSensor(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        SensorDevice sensor = sensorDeviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sensor not found"));

        sensor.setId(id);
        applySensorPayload(sensor, payload);
        ensureNodeExists(sensor.getNodeId());
        return ResponseEntity.ok(sensorDeviceRepository.save(sensor));
    }

    @DeleteMapping("/sensors/{id}")
    public ResponseEntity<Void> deleteSensor(@PathVariable Long id) {
        if (!sensorDeviceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sensor not found");
        }

        sensorDeviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyGatewayPayload(GatewayDevice gateway, Map<String, Object> payload) {
        gateway.setName(extractString(payload, "name"));
        gateway.setIpAddress(extractString(payload, "ipAddress"));
        gateway.setMacAddress(extractString(payload, "macAddress"));
        gateway.setMarkOrModel(extractString(payload, "markOrModel"));
        gateway.setAddressOrLocation(extractString(payload, "addressOrLocation"));
        gateway.setLatitude(extractDouble(payload, "latitude"));
        gateway.setLongitude(extractDouble(payload, "longitude"));
    }

    private void applyNodePayload(NodeDevice node, Map<String, Object> payload) {
        node.setName(extractString(payload, "name"));
        node.setIpAddress(extractString(payload, "ipAddress"));
        node.setMacAddress(extractString(payload, "macAddress"));
        node.setMarkOrModel(extractString(payload, "markOrModel"));
        node.setAddressOrLocation(extractString(payload, "addressOrLocation"));
        node.setLatitude(extractDouble(payload, "latitude"));
        node.setLongitude(extractDouble(payload, "longitude"));
        node.setGatewayId(extractRequiredId(payload, "gatewayId"));
    }

    private void applySensorPayload(SensorDevice sensor, Map<String, Object> payload) {
        sensor.setName(extractString(payload, "name"));
        sensor.setType(extractString(payload, "type"));
        sensor.setMeasurementType(extractString(payload, "measurementType"));
        sensor.setMeasurementUnit(extractString(payload, "measurementUnit"));
        sensor.setMeasurementValue(extractDouble(payload, "measurementValue"));
        sensor.setPrecision(extractDouble(payload, "precision"));
        sensor.setThreshold(extractDouble(payload, "threshold"));
        sensor.setSensorPrecision(extractDouble(payload, "sensorPrecision"));
        sensor.setLegacyPrecision(extractDouble(payload, "legacyPrecision", "_precision"));
        sensor.setNodeId(extractSensorNodeId(payload));
    }

    private Long extractSensorNodeId(Map<String, Object> payload) {
        Long nodeId = extractId(payload, "nodeId");
        if (nodeId != null) {
            return nodeId;
        }

        Object node = payload.get("node");
        if (node instanceof Map<?, ?> nodeMap) {
            Object idValue = nodeMap.get("id");
            return convertToLong(idValue);
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Node ID is required");
    }

    private void ensureGatewayExists(Long gatewayId) {
        if (gatewayId == null || !gatewayDeviceRepository.existsById(gatewayId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gateway ID does not exist");
        }
    }

    private void ensureNodeExists(Long nodeId) {
        if (nodeId == null || !nodeDeviceRepository.existsById(nodeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Node ID does not exist");
        }
    }

    private Long extractRequiredId(Map<String, Object> payload, String key) {
        Long value = extractId(payload, key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value;
    }

    private Long extractId(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Long value = convertToLong(payload.get(key));
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String extractString(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        return value == null ? null : value.toString();
    }

    private Double extractDouble(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object value = payload.get(key);
            if (value == null) {
                continue;
            }

            if (value instanceof Number number) {
                return number.doubleValue();
            }

            String stringValue = value.toString().trim();
            if (!stringValue.isEmpty()) {
                return Double.valueOf(stringValue);
            }
        }
        return null;
    }

    private Long convertToLong(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        String stringValue = value.toString().trim();
        if (stringValue.isEmpty()) {
            return null;
        }

        return Long.valueOf(stringValue);
    }

    private Long resolveCreateId(Long requestedId, Long lastKnownId) {
        return requestedId != null ? requestedId : lastKnownId + 1;
    }
}
