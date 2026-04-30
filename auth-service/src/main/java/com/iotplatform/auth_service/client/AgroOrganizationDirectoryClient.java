package com.iotplatform.auth_service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgroOrganizationDirectoryClient implements OrganizationDirectoryClient {

    private final RestClient agroServiceRestClient;

    @Override
    public boolean existsById(UUID organizationId) {
        try {
            agroServiceRestClient.get()
                    .uri("/api/agro/organizations/{id}", organizationId)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                return false;
            }

            throw exception;
        }
    }
}
