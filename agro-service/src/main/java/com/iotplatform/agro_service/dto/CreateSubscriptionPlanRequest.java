package com.iotplatform.agro_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionPlanRequest {

    @NotBlank(message = "code is required")
    @Size(max = 50, message = "code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must not exceed 150 characters")
    private String name;

    @Size(max = 500, message = "description must not exceed 500 characters")
    private String description;

    @Min(value = 1, message = "deviceLimit must be greater than 0")
    private Integer deviceLimit;

    @Min(value = 1, message = "fieldLimit must be greater than 0")
    private Integer fieldLimit;

    @DecimalMin(value = "0.0", inclusive = true, message = "priceMonthly must be greater than or equal to 0")
    private BigDecimal priceMonthly;

    @NotNull(message = "active is required")
    private Boolean active;
}
