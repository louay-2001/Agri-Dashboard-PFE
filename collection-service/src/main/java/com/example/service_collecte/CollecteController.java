package com.example.service_collecte;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/collecte")
public class CollecteController {

    @Autowired
    private DataCollectorService collectorService;

    @PostMapping("/gaz")
    public ResponseEntity<String> collectTemperature(@RequestParam("ppm") float ppm) {
        collectorService.sendPPM(ppm);
        return ResponseEntity.ok("✔ Donnée de gaz envoyée à InfluxDB !");
    }
}
