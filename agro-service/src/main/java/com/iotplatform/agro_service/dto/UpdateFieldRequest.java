package com.iotplatform.agro_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFieldRequest {

    @NotNull(message = "farmId is required")
    private UUID farmId;

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must not exceed 150 characters")
    private String name;

    @Size(max = 100, message = "cropType must not exceed 100 characters")
    private String cropType;

    @DecimalMin(value = "0.0", inclusive = false, message = "areaHectare must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "areaHectare must have at most 10 integer digits and 2 decimals")
    private BigDecimal areaHectare;
}
