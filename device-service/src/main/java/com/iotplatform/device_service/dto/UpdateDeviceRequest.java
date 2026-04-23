package com.iotplatform.device_service.dto;

import com.iotplatform.device_service.enums.DeviceStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeviceRequest {

    private UUID fieldId;

    @Size(max = 100, message = "firmwareVersion must not exceed 100 characters")
    private String firmwareVersion;

    private DeviceStatus status;
}
