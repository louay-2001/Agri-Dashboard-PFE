package com.iotplatform.device_service.dto;

import com.iotplatform.device_service.enums.DeviceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeviceResponse {

    private UUID id;
    private UUID fieldId;
    private UUID organizationId;
    private String deviceIdentifier;
    private String rawDeviceSecret;
    private String firmwareVersion;
    private DeviceStatus status;
    private Instant createdAt;
}
