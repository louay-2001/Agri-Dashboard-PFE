// src/main/java/com/example/service_traitement/dto/TemperaturePointDto.java
package com.example.service_traitement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TemperaturePointDto {
    private String timestamp;
    private double value;
}
