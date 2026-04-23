package com.iotplatform.device_service.mapper;

import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.DeviceResponse;
import com.iotplatform.device_service.entity.Device;
import org.springframework.stereotype.Component;

@Component
public class DeviceMapper {

    public DeviceResponse toDeviceResponse(Device device) {
        return DeviceResponse.builder()
                .id(device.getId())
                .fieldId(device.getFieldId())
                .organizationId(device.getOrganizationId())
                .deviceIdentifier(device.getDeviceIdentifier())
                .firmwareVersion(device.getFirmwareVersion())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .build();
    }

    public CreateDeviceResponse toCreateDeviceResponse(Device device, String rawDeviceSecret) {
        return CreateDeviceResponse.builder()
                .id(device.getId())
                .fieldId(device.getFieldId())
                .organizationId(device.getOrganizationId())
                .deviceIdentifier(device.getDeviceIdentifier())
                .rawDeviceSecret(rawDeviceSecret)
                .firmwareVersion(device.getFirmwareVersion())
                .status(device.getStatus())
                .createdAt(device.getCreatedAt())
                .build();
    }
}
