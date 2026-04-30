package com.iotplatform.agro_service.service.impl;

import com.iotplatform.agro_service.dto.CreateOrganizationRequest;
import com.iotplatform.agro_service.dto.OrganizationResponse;
import com.iotplatform.agro_service.dto.PublicOrganizationResponse;
import com.iotplatform.agro_service.entity.Organization;
import com.iotplatform.agro_service.exception.ResourceNotFoundException;
import com.iotplatform.agro_service.mapper.OrganizationMapper;
import com.iotplatform.agro_service.repository.FarmRepository;
import com.iotplatform.agro_service.repository.OrganizationRepository;
import com.iotplatform.agro_service.repository.SubscriptionPlanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceImplTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    private final OrganizationMapper organizationMapper = new OrganizationMapper();

    @InjectMocks
    private OrganizationServiceImpl organizationService;

    @Test
    void createOrganizationStoresSubscriptionPlanIdWhenPresent() {
        UUID organizationId = UUID.randomUUID();
        UUID subscriptionPlanId = UUID.randomUUID();

        when(subscriptionPlanRepository.existsById(subscriptionPlanId)).thenReturn(true);
        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
            Organization organization = invocation.getArgument(0);
            organization.setId(organizationId);
            organization.setCreatedAt(Instant.parse("2026-04-22T10:00:00Z"));
            return organization;
        });

        OrganizationServiceImpl service = new OrganizationServiceImpl(
                organizationRepository, farmRepository, subscriptionPlanRepository, organizationMapper
        );

        OrganizationResponse response = service.createOrganization(
                new CreateOrganizationRequest("Demo Org", subscriptionPlanId)
        );

        assertEquals(organizationId, response.getId());
        assertEquals(subscriptionPlanId, response.getSubscriptionPlanId());
        assertEquals("Demo Org", response.getName());
    }

    @Test
    void createOrganizationRejectsUnknownSubscriptionPlan() {
        UUID subscriptionPlanId = UUID.randomUUID();
        when(subscriptionPlanRepository.existsById(subscriptionPlanId)).thenReturn(false);

        OrganizationServiceImpl service = new OrganizationServiceImpl(
                organizationRepository, farmRepository, subscriptionPlanRepository, organizationMapper
        );

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> service.createOrganization(new CreateOrganizationRequest("Demo Org", subscriptionPlanId)));

        assertEquals("Subscription plan %s was not found".formatted(subscriptionPlanId), exception.getMessage());
    }

    @Test
    void getPublicOrganizationsReturnsOnlyIdAndName() {
        UUID organizationId = UUID.randomUUID();
        Organization organization = new Organization();
        organization.setId(organizationId);
        organization.setName("Demo Org");
        organization.setSubscriptionPlanId(UUID.randomUUID());
        organization.setCreatedAt(Instant.parse("2026-04-22T10:00:00Z"));

        when(organizationRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(organization));

        OrganizationServiceImpl service = new OrganizationServiceImpl(
                organizationRepository, farmRepository, subscriptionPlanRepository, organizationMapper
        );

        List<PublicOrganizationResponse> responses = service.getPublicOrganizations();

        assertEquals(1, responses.size());
        assertEquals(organizationId, responses.get(0).getId());
        assertEquals("Demo Org", responses.get(0).getName());
        verify(organizationRepository).findAllByOrderByCreatedAtDesc();
    }
}
