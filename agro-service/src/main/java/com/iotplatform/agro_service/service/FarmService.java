package com.iotplatform.agro_service.service;

import com.iotplatform.agro_service.dto.CreateFarmRequest;
import com.iotplatform.agro_service.dto.FarmResponse;
import com.iotplatform.agro_service.dto.UpdateFarmRequest;

import java.util.List;
import java.util.UUID;

public interface FarmService {

    FarmResponse createFarm(CreateFarmRequest request);

    List<FarmResponse> getFarms(UUID organizationId);

    FarmResponse getFarm(UUID organizationId, UUID id);

    FarmResponse updateFarm(UUID organizationId, UUID id, UpdateFarmRequest request);

    void deleteFarm(UUID organizationId, UUID id);
}
