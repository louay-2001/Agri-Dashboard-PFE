package com.example.service_alerte.controller;

import com.example.service_alerte.model.AlertData;
import com.example.service_alerte.service.AlerteService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
public class AlerteController {

    private final AlerteService alerteService;

    public AlerteController(AlerteService alerteService) {
        this.alerteService = alerteService;
    }

    @GetMapping
    public ResponseEntity<List<AlertData>> getCurrentAlerts() {
        return ResponseEntity.ok(alerteService.getAllAlerts());
    }

    @GetMapping("/all")
    public ResponseEntity<List<AlertData>> getAllAlerts() {
        return ResponseEntity.ok(alerteService.getAllAlerts());
    }

    @PutMapping("/{id}/ack")
    public ResponseEntity<AlertData> acknowledgeAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alerteService.acknowledgeAlert(id));
    }
}
