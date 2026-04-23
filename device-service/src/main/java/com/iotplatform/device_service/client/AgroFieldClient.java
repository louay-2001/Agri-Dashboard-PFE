package com.iotplatform.device_service.client;

import java.util.UUID;

public interface AgroFieldClient {

    void validateFieldOwnership(UUID organizationId, UUID fieldId);
}
