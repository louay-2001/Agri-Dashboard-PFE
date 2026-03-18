package com.example.service_traitement.controller;

import com.example.service_traitement.dto.StatsDto;
import com.example.service_traitement.dto.TemperaturePointDto;
import java.util.List;
import com.example.service_traitement.service.TemperatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/temperature")
@RequiredArgsConstructor


public class TemperatureController {

    private final TemperatureService temperatureService;

    @GetMapping("/points")
    public List<TemperaturePointDto> getTemperaturePoints() {
        return temperatureService.getTemperaturePoints();
    }

    @GetMapping("/stats")
    public StatsDto getStats() {
        return temperatureService.calculerStats();
    }
}
