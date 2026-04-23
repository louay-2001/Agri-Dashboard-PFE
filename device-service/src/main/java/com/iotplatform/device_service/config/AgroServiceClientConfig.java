package com.iotplatform.device_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AgroServiceClientConfig {

    @Bean
    public RestClient agroServiceRestClient(@Value("${clients.agro-service.base-url}") String agroServiceBaseUrl) {
        return RestClient.builder()
                .baseUrl(agroServiceBaseUrl)
                .build();
    }
}
