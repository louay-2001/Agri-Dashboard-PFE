package com.iotplatform.collection_service.util;

import com.iotplatform.collection_service.exception.InvalidMqttMessageException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MqttTopicParser {

    public MqttTopicIdentifiers parse(String topic) {
        if (topic == null || topic.isBlank()) {
            throw new InvalidMqttMessageException("MQTT topic is required");
        }

        String[] segments = topic.split("/", -1);
        if (segments.length != 4) {
            throw new InvalidMqttMessageException("MQTT topic must match agri/{org_id}/{device_id}/data");
        }

        if (!"agri".equals(segments[0]) || !"data".equals(segments[3])) {
            throw new InvalidMqttMessageException("MQTT topic must start with 'agri' and end with 'data'");
        }

        try {
            UUID organizationId = UUID.fromString(segments[1]);
            UUID deviceId = UUID.fromString(segments[2]);
            return new MqttTopicIdentifiers(organizationId, deviceId);
        } catch (IllegalArgumentException exception) {
            throw new InvalidMqttMessageException("organizationId and deviceId in topic must be valid UUIDs");
        }
    }
}
