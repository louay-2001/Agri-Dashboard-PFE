package com.iotplatform.agro_service.mapper;

import com.iotplatform.agro_service.dto.OrganizationResponse;
import com.iotplatform.agro_service.entity.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public OrganizationResponse toResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .subscriptionPlanId(organization.getSubscriptionPlanId())
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
