package com.iotplatform.device_service.controller;

import com.iotplatform.device_service.dto.CreateDeviceRequest;
import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.DeviceResponse;
import com.iotplatform.device_service.dto.UpdateDeviceRequest;
import com.iotplatform.device_service.security.RoleAccess;
import com.iotplatform.device_service.service.DeviceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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

import java.util.UUID;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping
    public ResponseEntity<CreateDeviceResponse> createDevice(HttpServletRequest httpRequest,
                                                             @Valid @RequestBody CreateDeviceRequest request) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceService.createDevice(request));
    }

    @GetMapping
    public ResponseEntity<Page<DeviceResponse>> getDevices(
            @RequestParam UUID organizationId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(deviceService.getDevices(organizationId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponse> getDevice(@PathVariable UUID id, @RequestParam UUID organizationId) {
        return ResponseEntity.ok(deviceService.getDevice(organizationId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceResponse> updateDevice(@PathVariable UUID id,
                                                       HttpServletRequest httpRequest,
                                                       @RequestParam UUID organizationId,
                                                       @Valid @RequestBody UpdateDeviceRequest request) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        return ResponseEntity.ok(deviceService.updateDevice(organizationId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable UUID id,
                                             HttpServletRequest httpRequest,
                                             @RequestParam UUID organizationId) {
        RoleAccess.requireManagerOrAdmin(httpRequest);
        deviceService.deleteDevice(organizationId, id);
        return ResponseEntity.noContent().build();
    }
}
