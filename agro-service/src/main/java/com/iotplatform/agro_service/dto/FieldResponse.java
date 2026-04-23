package com.iotplatform.agro_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldResponse {

    private UUID id;
    private UUID farmId;
    private UUID organizationId;
    private String name;
    private String cropType;
    private BigDecimal areaHectare;
    private Instant createdAt;
}
