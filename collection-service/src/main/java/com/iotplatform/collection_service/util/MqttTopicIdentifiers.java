package com.iotplatform.collection_service.util;

import java.util.UUID;

public record MqttTopicIdentifiers(UUID organizationId, UUID deviceId) {
}
