package com.iotplatform.collection_service.controller;

import com.iotplatform.collection_service.dto.SensorReadingResponse;
import com.iotplatform.collection_service.service.SensorReadingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/collection/readings", "/api/collecte/readings"})
@RequiredArgsConstructor
public class SensorReadingController {

    private final SensorReadingQueryService sensorReadingQueryService;

    @GetMapping
    public ResponseEntity<Page<SensorReadingResponse>> getReadings(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID deviceId,
            @PageableDefault(size = 50, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(sensorReadingQueryService.getReadings(organizationId, deviceId, pageable));
    }

    @GetMapping("/latest")
    public ResponseEntity<SensorReadingResponse> getLatestReading(@RequestParam UUID organizationId,
                                                                  @RequestParam UUID deviceId) {
        return ResponseEntity.ok(sensorReadingQueryService.getLatestReading(organizationId, deviceId));
    }
}
