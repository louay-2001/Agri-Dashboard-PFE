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
public class SubscriptionPlanResponse {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private Integer deviceLimit;
    private Integer fieldLimit;
    private BigDecimal priceMonthly;
    private boolean active;
    private Instant createdAt;
}
