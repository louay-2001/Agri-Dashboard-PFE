package com.iotplatform.collection_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceLookupResponse {

    private UUID id;
    private UUID fieldId;
    private UUID organizationId;
    private String deviceIdentifier;
}
