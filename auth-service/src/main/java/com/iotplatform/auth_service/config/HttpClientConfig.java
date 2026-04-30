package com.iotplatform.auth_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient agroServiceRestClient(RestClient.Builder restClientBuilder,
                                            @Value("${agro.service.base-url}") String agroServiceBaseUrl) {
        return restClientBuilder
                .baseUrl(agroServiceBaseUrl)
                .build();
    }
}
