package com.example.service_collecte;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.time.Instant;
import java.util.Random;
@Service
public class TemperatureSenderService {

    // Removed unused field influxDBClient
    private final WriteApi writeApi;
    private final String bucket;
    private final String org;
    private final Random random = new Random();

    public TemperatureSenderService(
            InfluxDBClient influxDBClient,
            @Value("${influx.bucket}") String bucket,
            @Value("${influx.org}") String org) {
        // Removed assignment of unused field influxDBClient
        this.bucket = bucket;
        this.org = org;
        this.writeApi = influxDBClient.makeWriteApi();
    }

    @PreDestroy
    public void cleanup() {
        if (writeApi != null) writeApi.close();
    }

    @Scheduled(fixedRate = 5000)
    public void sendTemperature() {
        double temperature = 20 + random.nextDouble() * 10;

        Point point = Point
                .measurement("temperature")
                .addTag("capteur", "capteur1")
                .addField("value", temperature)
                .time(Instant.now(), WritePrecision.NS);

        writeApi.writePoint(bucket, org, point);
        System.out.println("✔ Donnée envoyée : " + temperature + "°C");
    }
}
