package com.iotplatform.agro_service.dto;

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
public class FarmResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String location;
    private Instant createdAt;
}
