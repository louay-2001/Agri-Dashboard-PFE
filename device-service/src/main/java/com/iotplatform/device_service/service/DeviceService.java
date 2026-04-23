package com.iotplatform.device_service.service;

import com.iotplatform.device_service.dto.CreateDeviceRequest;
import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.DeviceResponse;
import com.iotplatform.device_service.dto.UpdateDeviceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DeviceService {

    CreateDeviceResponse createDevice(CreateDeviceRequest request);

    Page<DeviceResponse> getDevices(UUID organizationId, Pageable pageable);

    DeviceResponse getDevice(UUID organizationId, UUID id);

    DeviceResponse updateDevice(UUID organizationId, UUID id, UpdateDeviceRequest request);

    void deleteDevice(UUID organizationId, UUID id);
}
