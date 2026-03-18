package com.example.service_alerte.controller;

import com.example.service_alerte.model.GatewayDevice;
import com.example.service_alerte.model.NodeDevice;
import com.example.service_alerte.model.SensorDevice;
import com.example.service_alerte.repository.GatewayDeviceRepository;
import com.example.service_alerte.repository.NodeDeviceRepository;
import com.example.service_alerte.repository.SensorDeviceRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/nodes")
    public List<NodeDevice> getAllNodes() {
        return nodeDeviceRepository.findAll();
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<NodeDevice> getNodeById(@PathVariable Long id) {
        return ResponseEntity.of(nodeDeviceRepository.findById(id));
    }

    @GetMapping("/sensors")
    public List<SensorDevice> getAllSensors() {
        return sensorDeviceRepository.findAll();
    }

    @GetMapping("/sensors/{id}")
    public ResponseEntity<SensorDevice> getSensorById(@PathVariable Long id) {
        return ResponseEntity.of(sensorDeviceRepository.findById(id));
    }
}