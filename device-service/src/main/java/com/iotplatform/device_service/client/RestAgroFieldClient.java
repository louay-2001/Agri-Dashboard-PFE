package com.iotplatform.device_service.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iotplatform.device_service.exception.BadRequestException;
import com.iotplatform.device_service.exception.DependentServiceException;
import com.iotplatform.device_service.exception.FieldOwnershipNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RestAgroFieldClient implements AgroFieldClient {

    private final RestClient agroServiceRestClient;
    private final ObjectMapper objectMapper;

    @Override
    public void validateFieldOwnership(UUID organizationId, UUID fieldId) {
        try {
            agroServiceRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/agro/fields/{fieldId}")
                            .queryParam("organizationId", organizationId)
                            .build(fieldId))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound exception) {
            throw new FieldOwnershipNotFoundException(
                    extractMessage(exception, "Field %s was not found for organization %s"
                            .formatted(fieldId, organizationId))
            );
        } catch (HttpClientErrorException.BadRequest exception) {
            throw new BadRequestException(extractMessage(exception, "Invalid field validation request"));
        } catch (RestClientResponseException exception) {
            throw new DependentServiceException("Agro-service could not validate the provided field");
        } catch (ResourceAccessException exception) {
            throw new DependentServiceException("Agro-service is unavailable for field validation");
        } catch (RestClientException exception) {
            throw new DependentServiceException("Unable to validate the provided field against agro-service");
        }
    }

    private String extractMessage(RestClientResponseException exception, String fallbackMessage) {
        try {
            AgroServiceErrorResponse errorResponse = objectMapper.readValue(
                    exception.getResponseBodyAsByteArray(),
                    AgroServiceErrorResponse.class
            );

            if (errorResponse.message() != null && !errorResponse.message().isBlank()) {
                return errorResponse.message();
            }
        } catch (Exception ignored) {
            // Fall back to the default message if the upstream error body cannot be parsed.
        }

        return fallbackMessage;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AgroServiceErrorResponse(String message) {
    }
}
