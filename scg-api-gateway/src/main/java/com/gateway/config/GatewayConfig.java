package com.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // Auth Service
                .route("auth-service", r -> r.path("/auth/**")
                        .uri("lb://auth-service"))

                // Alert Service
                .route("alert-service", r -> r.path("/api/alerts/**")
                        .uri("lb://service-alerte"))

                // Phase 1 MVP: expose inventory reads from the service that already owns the MySQL schema
                .route("inventory-service", r -> r.path("/api/gateways/**", "/api/nodes/**", "/api/sensors/**", "/api/dashboard/**")
                        .uri("lb://service-alerte"))

                // Weather Service
                .route("weather-service", r -> r.path("/api/weather/**")
                        .uri("lb://weather-service"))

                // Collection Service
                .route("collection-service", r -> r.path("/api/collection/**", "/api/collecte/**")
                        .uri("lb://service-collecte"))

                // Processing Service
                .route("processing-service", r -> r.path("/api/processing/**", "/api/traitement/**")
                        .uri("lb://service-traitement"))

                // Agro Service
                .route("agro-service", r -> r.path("/api/agro/**")
                        .uri("lb://agro-service"))

                // Prediction Service
                .route("prediction-service", r -> r.path("/api/prediction/**")
                        .uri("lb://prediction-service"))

                .build();
    }
}
