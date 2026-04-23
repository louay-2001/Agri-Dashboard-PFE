package com.iotplatform.collection_service.client;

import com.iotplatform.collection_service.dto.DeviceLookupResponse;
import com.iotplatform.collection_service.exception.ResourceNotFoundException;
import com.iotplatform.collection_service.exception.UpstreamServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DeviceServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${device-service.base-url}")
    private String deviceServiceBaseUrl;

    public DeviceLookupResponse getDevice(UUID organizationId, UUID deviceId) {
        try {
            DeviceLookupResponse response = restClientBuilder
                    .baseUrl(deviceServiceBaseUrl)
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/devices/{id}")
                            .queryParam("organizationId", organizationId)
                            .build(deviceId))
                    .retrieve()
                    .body(DeviceLookupResponse.class);

            if (response == null) {
                throw new UpstreamServiceException("device-service returned an empty response");
            }

            return response;
        } catch (RestClientResponseException exception) {
            if (HttpStatus.NOT_FOUND.value() == exception.getStatusCode().value()) {
                throw new ResourceNotFoundException(
                        "Device %s was not found for organization %s".formatted(deviceId, organizationId)
                );
            }

            throw new UpstreamServiceException("device-service request failed with status %s"
                    .formatted(exception.getStatusCode().value()), exception);
        } catch (RestClientException exception) {
            throw new UpstreamServiceException("Unable to reach device-service for device validation", exception);
        }
    }
}
