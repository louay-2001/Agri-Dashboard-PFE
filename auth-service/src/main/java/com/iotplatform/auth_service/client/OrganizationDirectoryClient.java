package com.iotplatform.auth_service.client;

import java.util.UUID;

public interface OrganizationDirectoryClient {

    boolean existsById(UUID organizationId);
}
