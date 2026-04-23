package com.iotplatform.agro_service.service.impl;

import com.iotplatform.agro_service.dto.CreateFieldRequest;
import com.iotplatform.agro_service.dto.FieldResponse;
import com.iotplatform.agro_service.dto.UpdateFieldRequest;
import com.iotplatform.agro_service.entity.Farm;
import com.iotplatform.agro_service.entity.Field;
import com.iotplatform.agro_service.exception.ResourceNotFoundException;
import com.iotplatform.agro_service.mapper.FieldMapper;
import com.iotplatform.agro_service.repository.FarmRepository;
import com.iotplatform.agro_service.repository.FieldRepository;
import com.iotplatform.agro_service.repository.OrganizationRepository;
import com.iotplatform.agro_service.service.FieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldServiceImpl implements FieldService {

    private final FieldRepository fieldRepository;
    private final FarmRepository farmRepository;
    private final OrganizationRepository organizationRepository;
    private final FieldMapper fieldMapper;

    @Override
    @Transactional
    public FieldResponse createField(CreateFieldRequest request) {
        UUID organizationId = request.getOrganizationId();
        Farm farm = findScopedFarm(request.getFarmId(), organizationId);

        Field field = new Field();
        field.setFarmId(farm.getId());
        field.setName(request.getName().trim());
        field.setCropType(trimToNull(request.getCropType()));
        field.setAreaHectare(request.getAreaHectare());

        return fieldMapper.toResponse(fieldRepository.save(field), organizationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldResponse> getFields(UUID organizationId, UUID farmId) {
        ensureOrganizationExists(organizationId);

        if (farmId != null) {
            findScopedFarm(farmId, organizationId);
            return fieldRepository.findByFarmIdOrderByCreatedAtDesc(farmId)
                    .stream()
                    .map(field -> fieldMapper.toResponse(field, organizationId))
                    .toList();
        }

        List<UUID> farmIds = farmRepository.findIdsByOrganizationId(organizationId);
        if (farmIds.isEmpty()) {
            return Collections.emptyList();
        }

        return fieldRepository.findByFarmIdInOrderByCreatedAtDesc(farmIds)
                .stream()
                .map(field -> fieldMapper.toResponse(field, organizationId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FieldResponse getField(UUID organizationId, UUID id) {
        return fieldMapper.toResponse(findScopedField(id, organizationId), organizationId);
    }

    @Override
    @Transactional
    public FieldResponse updateField(UUID organizationId, UUID id, UpdateFieldRequest request) {
        Field field = findScopedField(id, organizationId);
        Farm farm = findScopedFarm(request.getFarmId(), organizationId);

        field.setFarmId(farm.getId());
        field.setName(request.getName().trim());
        field.setCropType(trimToNull(request.getCropType()));
        field.setAreaHectare(request.getAreaHectare());

        return fieldMapper.toResponse(fieldRepository.save(field), organizationId);
    }

    @Override
    @Transactional
    public void deleteField(UUID organizationId, UUID id) {
        Field field = findScopedField(id, organizationId);
        fieldRepository.delete(field);
    }

    private Field findScopedField(UUID id, UUID organizationId) {
        ensureOrganizationExists(organizationId);

        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Field %s was not found".formatted(id)
                ));

        boolean belongsToOrganization = farmRepository.findByIdAndOrganizationId(field.getFarmId(), organizationId).isPresent();
        if (!belongsToOrganization) {
            throw new ResourceNotFoundException(
                    "Field %s was not found for organization %s".formatted(id, organizationId)
            );
        }

        return field;
    }

    private Farm findScopedFarm(UUID farmId, UUID organizationId) {
        ensureOrganizationExists(organizationId);

        return farmRepository.findByIdAndOrganizationId(farmId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Farm %s was not found for organization %s".formatted(farmId, organizationId)
                ));
    }

    private void ensureOrganizationExists(UUID organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization %s was not found".formatted(organizationId));
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
