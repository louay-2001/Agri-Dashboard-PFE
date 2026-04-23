package com.iotplatform.collection_service.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mqtt")
public class MqttProperties {

    private boolean enabled = true;

    @NotBlank
    private String brokerUrl;

    @NotBlank
    private String clientId;

    @NotBlank
    private String topicFilter;

    private String username;

    private String password;

    @Min(0)
    @Max(2)
    private int qos = 1;

    @Min(1)
    private int connectionTimeoutSeconds = 10;

    @Min(1)
    private int keepAliveIntervalSeconds = 30;
}
