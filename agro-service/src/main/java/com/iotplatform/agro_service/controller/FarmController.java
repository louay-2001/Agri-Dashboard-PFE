package com.iotplatform.agro_service.controller;

import com.iotplatform.agro_service.dto.CreateFarmRequest;
import com.iotplatform.agro_service.dto.FarmResponse;
import com.iotplatform.agro_service.dto.UpdateFarmRequest;
import com.iotplatform.agro_service.security.RoleAccess;
import com.iotplatform.agro_service.service.FarmService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agro/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(HttpServletRequest httpRequest,
                                                   @Valid @RequestBody CreateFarmRequest createRequest) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(farmService.createFarm(createRequest));
    }

    @GetMapping
    public ResponseEntity<List<FarmResponse>> getFarms(@RequestParam UUID organizationId) {
        return ResponseEntity.ok(farmService.getFarms(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getFarm(@PathVariable UUID id, @RequestParam UUID organizationId) {
        return ResponseEntity.ok(farmService.getFarm(organizationId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FarmResponse> updateFarm(@PathVariable UUID id,
                                                   HttpServletRequest httpRequest,
                                                   @RequestParam UUID organizationId,
                                                   @Valid @RequestBody UpdateFarmRequest updateRequest) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.ok(farmService.updateFarm(organizationId, id, updateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable UUID id,
                                           HttpServletRequest httpRequest,
                                           @RequestParam UUID organizationId) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        farmService.deleteFarm(organizationId, id);
        return ResponseEntity.noContent().build();
    }
}
