package com.iotplatform.agro_service.mapper;

import com.iotplatform.agro_service.dto.FarmResponse;
import com.iotplatform.agro_service.entity.Farm;
import org.springframework.stereotype.Component;

@Component
public class FarmMapper {

    public FarmResponse toResponse(Farm farm) {
        return FarmResponse.builder()
                .id(farm.getId())
                .organizationId(farm.getOrganizationId())
                .name(farm.getName())
                .location(farm.getLocation())
                .createdAt(farm.getCreatedAt())
                .build();
    }
}
