package com.iotplatform.agro_service.mapper;

import com.iotplatform.agro_service.dto.FieldResponse;
import com.iotplatform.agro_service.entity.Field;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class FieldMapper {

    public FieldResponse toResponse(Field field, UUID organizationId) {
        return FieldResponse.builder()
                .id(field.getId())
                .farmId(field.getFarmId())
                .organizationId(organizationId)
                .name(field.getName())
                .cropType(field.getCropType())
                .areaHectare(field.getAreaHectare())
                .createdAt(field.getCreatedAt())
                .build();
    }
}
