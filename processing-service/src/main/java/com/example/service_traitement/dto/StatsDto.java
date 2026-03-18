package com.example.service_traitement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsDto {
    private double moyenne;
    private double max;
    private double min;
}
