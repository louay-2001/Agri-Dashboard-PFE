package com.iotplatform.agro_service.service;

import com.iotplatform.agro_service.dto.CreateOrganizationRequest;
import com.iotplatform.agro_service.dto.OrganizationResponse;
import com.iotplatform.agro_service.dto.PublicOrganizationResponse;
import com.iotplatform.agro_service.dto.UpdateOrganizationRequest;

import java.util.List;
import java.util.UUID;

public interface OrganizationService {

    OrganizationResponse createOrganization(CreateOrganizationRequest request);

    List<OrganizationResponse> getOrganizations();

    List<PublicOrganizationResponse> getPublicOrganizations();

    OrganizationResponse getOrganization(UUID id);

    OrganizationResponse updateOrganization(UUID id, UpdateOrganizationRequest request);

    void deleteOrganization(UUID id);
}
