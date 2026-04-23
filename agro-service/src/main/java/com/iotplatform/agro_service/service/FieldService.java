package com.iotplatform.agro_service.service;

import com.iotplatform.agro_service.dto.CreateFieldRequest;
import com.iotplatform.agro_service.dto.FieldResponse;
import com.iotplatform.agro_service.dto.UpdateFieldRequest;

import java.util.List;
import java.util.UUID;

public interface FieldService {

    FieldResponse createField(CreateFieldRequest request);

    List<FieldResponse> getFields(UUID organizationId, UUID farmId);

    FieldResponse getField(UUID organizationId, UUID id);

    FieldResponse updateField(UUID organizationId, UUID id, UpdateFieldRequest request);

    void deleteField(UUID organizationId, UUID id);
}
