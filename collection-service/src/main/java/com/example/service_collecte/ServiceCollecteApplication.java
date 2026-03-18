package com.example.service_collecte;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.beans.factory.annotation.Value;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class ServiceCollecteApplication {

    @Value("${influx.url}")
    private String influxUrl;

    @Value("${influx.token}")
    private String influxToken;

    @Value("${influx.org}")
    private String influxOrg;

    @Value("${influx.bucket}")
    private String influxBucket;

    public static void main(String[] args) {
        SpringApplication.run(ServiceCollecteApplication.class, args);
    }

    @PostConstruct
    public void logConfig() {
        System.out.println("Influx URL: " + influxUrl);
        System.out.println("Influx Token: " + influxToken);
        System.out.println("Influx Org: " + influxOrg);
        System.out.println("Influx Bucket: " + influxBucket);
    }
}
