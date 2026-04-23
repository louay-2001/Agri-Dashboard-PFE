package com.iotplatform.collection_service.service.impl;

import com.iotplatform.collection_service.config.MqttProperties;
import com.iotplatform.collection_service.service.SensorReadingIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "mqtt", name = "enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class MqttSubscriberService implements SmartLifecycle {

    private final MqttProperties mqttProperties;
    private final SensorReadingIngestionService sensorReadingIngestionService;

    private volatile boolean running;
    private MqttClient mqttClient;

    @Override
    public synchronized void start() {
        if (running) {
            return;
        }

        try {
            mqttClient = new MqttClient(
                    mqttProperties.getBrokerUrl(),
                    mqttProperties.getClientId(),
                    new MemoryPersistence()
            );
            mqttClient.setCallback(new MqttCallbackExtended() {
                @Override
                public void connectComplete(boolean reconnect, String serverURI) {
                    if (reconnect) {
                        subscribeToTopic();
                    }
                    log.info("MQTT connection established to {}", serverURI);
                }

                @Override
                public void connectionLost(Throwable cause) {
                    log.warn("MQTT connection lost: {}", cause == null ? "unknown reason" : cause.getMessage());
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
                    try {
                        sensorReadingIngestionService.ingest(topic, payload);
                        log.info("Persisted sensor reading from topic {}", topic);
                    } catch (Exception exception) {
                        log.warn("Failed to process MQTT message from topic {}: {}", topic, exception.getMessage());
                        log.debug("MQTT message processing failure", exception);
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                }
            });

            mqttClient.connect(buildConnectOptions());
            subscribeToTopic();
            running = true;
        } catch (MqttException exception) {
            throw new IllegalStateException("Failed to start MQTT subscriber", exception);
        }
    }

    @Override
    public synchronized void stop() {
        if (mqttClient == null) {
            running = false;
            return;
        }

        try {
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
            mqttClient.close();
        } catch (MqttException exception) {
            log.warn("Failed to stop MQTT client cleanly: {}", exception.getMessage());
        } finally {
            running = false;
        }
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    private MqttConnectOptions buildConnectOptions() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);
        options.setCleanSession(false);
        options.setConnectionTimeout(mqttProperties.getConnectionTimeoutSeconds());
        options.setKeepAliveInterval(mqttProperties.getKeepAliveIntervalSeconds());

        if (mqttProperties.getUsername() != null && !mqttProperties.getUsername().isBlank()) {
            options.setUserName(mqttProperties.getUsername());
        }
        if (mqttProperties.getPassword() != null && !mqttProperties.getPassword().isBlank()) {
            options.setPassword(mqttProperties.getPassword().toCharArray());
        }

        return options;
    }

    private void subscribeToTopic() {
        try {
            mqttClient.subscribe(mqttProperties.getTopicFilter(), mqttProperties.getQos());
            log.info("Subscribed to MQTT topic filter {}", mqttProperties.getTopicFilter());
        } catch (MqttException exception) {
            throw new IllegalStateException("Failed to subscribe to MQTT topic filter", exception);
        }
    }
}
