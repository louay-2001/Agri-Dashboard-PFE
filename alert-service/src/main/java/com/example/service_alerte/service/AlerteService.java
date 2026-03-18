package com.example.service_alerte.service;

import com.example.service_alerte.model.AlertData;
import com.example.service_alerte.repository.AlertDataRepository;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.QueryApi;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

@Service
public class AlerteService {

    @Autowired
    private AlertDataRepository alertDataRepository;

    @Autowired
    private EmailService emailService;

    private static final String TOKEN = "-paaZ3-GVK72WmIU9KlXzupan3RCSfG4XcAuBbQOKvPHyJboyLPsg4iqdz7VYR4O8ZvietELb81iI4PaC49W6g==";
    private static final String ORG = "Academie";
    private static final String BUCKET = "TOCKEN";
    private static final String URL = "http://localhost:8086";
    private static final String DESTINATAIRE = "destinataire@example.com";

    private InfluxDBClient influxDBClient;

    @PostConstruct
    public void init() {
        influxDBClient = InfluxDBClientFactory.create(URL, TOKEN.toCharArray(), ORG, BUCKET);

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                verifierTemperature();
            }
        }, 0, 30000); // toutes les 30 secondes
    }

    public void verifierTemperature() {
        String fluxQuery = """
            from(bucket: "TOCKEN")
              |> range(start: -10m)
              |> filter(fn: (r) => r._measurement == "temperature" and r._field == "value")
              |> last()
            """;

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(fluxQuery, ORG);

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                Double temperature = ((Number) record.getValue()).doubleValue();
                Instant timestamp = record.getTime();

                if (temperature > 28.0) {
                    System.out.println("🚨 ALERTE ! Température élevée détectée : " + temperature + " °C");

                    AlertData alert = new AlertData(
                            "temperature",
                            temperature.floatValue(),
                            timestamp,
                            "High temperature alert",
                            28.0f,
                            "CapteurTempérature1" // ✅ nom du capteur
                    );

                    alertDataRepository.save(alert);

                    String sujet = "🚨 Alerte Température Élevée";
                    String message = "Une température anormalement élevée a été détectée : " + temperature + " °C";
                    emailService.envoyerAlerte(sujet, message, DESTINATAIRE);
                }
            }
        }
    }

    public List<AlertData> verifierDonnees(float temp, float gaz) {
        List<AlertData> alertes = new ArrayList<>();
        Instant now = Instant.now();

        if (temp > 50) {
            AlertData alert = new AlertData(
                    "temperature",
                    temp,
                    now,
                    "High temperature alert",
                    50.0f,
                    "CapteurTempérature1" // ✅ nom du capteur
            );
            alertDataRepository.save(alert);
            alertes.add(alert);

            String sujet = "🚨 Température critique détectée";
            String message = "La température est de " + temp + " °C. Seuil critique dépassé.";
            emailService.envoyerAlerte(sujet, message, DESTINATAIRE);
        }

        if (gaz > 400) {
            AlertData alert = new AlertData(
                    "gaz",
                    gaz,
                    now,
                    "High gas level alert",
                    400.0f,
                    "CapteurGaz1" // ✅ nom du capteur
            );
            alertDataRepository.save(alert);
            alertes.add(alert);

            String sujet = "🚨 Niveau de gaz élevé détecté";
            String message = "Le niveau de gaz est de " + gaz + " ppm. Seuil critique dépassé.";
            emailService.envoyerAlerte(sujet, message, DESTINATAIRE);
        }

        return alertes;
    }

    public List<AlertData> getAllAlerts() {
        return alertDataRepository.findAll();
    }
}
