package com.iotplatform.device_service.dto;

import jakarta.validation.constraints.NotNull;
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
public class CreateDeviceRequest {

    @NotNull(message = "fieldId is required")
    private UUID fieldId;

    @NotNull(message = "organizationId is required")
    private UUID organizationId;

    @Size(max = 100, message = "firmwareVersion must not exceed 100 characters")
    private String firmwareVersion;
}
