package com.example.service_alerte.controller;

import com.example.service_alerte.model.AlertData;
import com.example.service_alerte.service.AlerteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlerteController {

    @Autowired
    private AlerteService alerteService;

    @GetMapping
    public ResponseEntity<List<AlertData>> verifierSeuilsManuellement(
            @RequestParam(defaultValue = "30") float temp,
            @RequestParam(defaultValue = "300") float gaz) {

        System.out.println("Verification des seuils : temperature = " + temp + " C | gaz = " + gaz + " ppm");
        List<AlertData> alertes = alerteService.verifierDonnees(temp, gaz);
        return ResponseEntity.ok(alertes);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AlertData>> getAllAlerts() {
        return ResponseEntity.ok(alerteService.getAllAlerts());
    }
}