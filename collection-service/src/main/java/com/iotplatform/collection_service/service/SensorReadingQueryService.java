package com.iotplatform.collection_service.service;

import com.iotplatform.collection_service.dto.SensorReadingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SensorReadingQueryService {

    Page<SensorReadingResponse> getReadings(UUID organizationId, UUID deviceId, Pageable pageable);

    SensorReadingResponse getLatestReading(UUID organizationId, UUID deviceId);
}
