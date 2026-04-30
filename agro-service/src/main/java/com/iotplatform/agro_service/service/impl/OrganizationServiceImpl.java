package com.iotplatform.agro_service.service.impl;

import com.iotplatform.agro_service.dto.CreateOrganizationRequest;
import com.iotplatform.agro_service.dto.OrganizationResponse;
import com.iotplatform.agro_service.dto.PublicOrganizationResponse;
import com.iotplatform.agro_service.dto.UpdateOrganizationRequest;
import com.iotplatform.agro_service.entity.Organization;
import com.iotplatform.agro_service.exception.ConflictException;
import com.iotplatform.agro_service.exception.ResourceNotFoundException;
import com.iotplatform.agro_service.mapper.OrganizationMapper;
import com.iotplatform.agro_service.repository.FarmRepository;
import com.iotplatform.agro_service.repository.OrganizationRepository;
import com.iotplatform.agro_service.repository.SubscriptionPlanRepository;
import com.iotplatform.agro_service.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final FarmRepository farmRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OrganizationMapper organizationMapper;

    @Override
    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        Organization organization = new Organization();
        organization.setName(request.getName().trim());
        organization.setSubscriptionPlanId(resolveSubscriptionPlanId(request.getSubscriptionPlanId()));

        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizations() {
        return organizationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(organizationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicOrganizationResponse> getPublicOrganizations() {
        return organizationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(organizationMapper::toPublicResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID id) {
        return organizationMapper.toResponse(findOrganization(id));
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(UUID id, UpdateOrganizationRequest request) {
        Organization organization = findOrganization(id);
        organization.setName(request.getName().trim());
        organization.setSubscriptionPlanId(resolveSubscriptionPlanId(request.getSubscriptionPlanId()));

        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    @Transactional
    public void deleteOrganization(UUID id) {
        Organization organization = findOrganization(id);

        if (farmRepository.existsByOrganizationId(id)) {
            throw new ConflictException("Organization %s cannot be deleted while farms still exist".formatted(id));
        }

        organizationRepository.delete(organization);
    }

    private Organization findOrganization(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organization %s was not found".formatted(id)
                ));
    }

    private UUID resolveSubscriptionPlanId(UUID subscriptionPlanId) {
        if (subscriptionPlanId == null) {
            return null;
        }

        if (!subscriptionPlanRepository.existsById(subscriptionPlanId)) {
            throw new ResourceNotFoundException(
                    "Subscription plan %s was not found".formatted(subscriptionPlanId)
            );
        }

        return subscriptionPlanId;
    }
}
