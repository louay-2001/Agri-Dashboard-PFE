package com.example.service_collecte;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import org.springframework.stereotype.Service;

import java.time.Instant;
@Service
public class DataCollectorService {

    private final InfluxDBClient client;

    public DataCollectorService(InfluxDBClient client) {
        this.client = client;
    }

    public void sendPPM(float ppm) {
        Point point = Point
                .measurement("gaz")
                .addTag("capteur", "mq135")
                .addField("ppm", ppm)
                .time(Instant.now(), WritePrecision.MS);

        client.getWriteApiBlocking().writePoint(point);
        System.out.println("✔ PPM envoyé à InfluxDB : " + ppm);
    }
}

