package com.example.service_traitement.service;

import com.example.service_traitement.dto.StatsDto;
import com.example.service_traitement.dto.TemperaturePointDto;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TemperatureService {

    private final InfluxDBClient influxDBClient;

    public List<TemperaturePointDto> getTemperaturePoints() {
    QueryApi queryApi = influxDBClient.getQueryApi();

    String flux = """
        from(bucket: "mon-bucket")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "temperature")
          |> filter(fn: (r) => r._field == "value")
          |> keep(columns: ["_time", "_value"])
    """;

    var results = queryApi.query(flux);
    List<TemperaturePointDto> points = new ArrayList<>();

    for (var table : results) {
        for (var record : table.getRecords()) {
            String timestamp = record.getTime().toString(); // format ISO 8601
            double value = ((Number) record.getValue()).doubleValue();
            points.add(new TemperaturePointDto(timestamp, value));
        }
    }

    return points;
}

    public StatsDto calculerStats() {
        QueryApi queryApi = influxDBClient.getQueryApi();

        String flux = """
                from(bucket: "mon-bucket")
                  |> range(start: -1h)
                  |> filter(fn: (r) => r._measurement == "temperature")
                  |> filter(fn: (r) => r._field == "value")
                  |> keep(columns: ["_value"])
            """;

        var results = queryApi.query(flux);
        double somme = 0;
        double max = Double.MIN_VALUE;
        double min = Double.MAX_VALUE;
        int count = 0;

        for (var table : results) {
            for (var record : table.getRecords()) {
                Double val = ((Number) record.getValue()).doubleValue();
                somme += val;
                max = Math.max(max, val);
                min = Math.min(min, val);
                count++;
            }
        }

        return count == 0 ? new StatsDto(0, 0, 0) : new StatsDto(somme / count, max, min);
    }
}
