package com.iotplatform.collection_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SensorPayloadRequest {

    private Double temperature;

    @DecimalMin(value = "0.0", message = "humidity must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "humidity must be less than or equal to 100")
    private Double humidity;

    @JsonProperty("soil_moisture")
    @DecimalMin(value = "0.0", message = "soil_moisture must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "soil_moisture must be less than or equal to 100")
    private Double soilMoisture;

    @JsonProperty("battery_level")
    @DecimalMin(value = "0.0", message = "battery_level must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "battery_level must be less than or equal to 100")
    private Double batteryLevel;
}
