package com.iotplatform.agro_service.service.impl;

import com.iotplatform.agro_service.dto.CreateFarmRequest;
import com.iotplatform.agro_service.dto.FarmResponse;
import com.iotplatform.agro_service.dto.UpdateFarmRequest;
import com.iotplatform.agro_service.entity.Farm;
import com.iotplatform.agro_service.exception.ConflictException;
import com.iotplatform.agro_service.exception.ResourceNotFoundException;
import com.iotplatform.agro_service.mapper.FarmMapper;
import com.iotplatform.agro_service.repository.FieldRepository;
import com.iotplatform.agro_service.repository.FarmRepository;
import com.iotplatform.agro_service.repository.OrganizationRepository;
import com.iotplatform.agro_service.service.FarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FieldRepository fieldRepository;
    private final OrganizationRepository organizationRepository;
    private final FarmMapper farmMapper;

    @Override
    @Transactional
    public FarmResponse createFarm(CreateFarmRequest request) {
        UUID organizationId = request.getOrganizationId();
        ensureOrganizationExists(organizationId);

        Farm farm = new Farm();
        farm.setOrganizationId(organizationId);
        farm.setName(request.getName().trim());
        farm.setLocation(trimToNull(request.getLocation()));

        return farmMapper.toResponse(farmRepository.save(farm));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmResponse> getFarms(UUID organizationId) {
        ensureOrganizationExists(organizationId);

        return farmRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .stream()
                .map(farmMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FarmResponse getFarm(UUID organizationId, UUID id) {
        return farmMapper.toResponse(findScopedFarm(id, organizationId));
    }

    @Override
    @Transactional
    public FarmResponse updateFarm(UUID organizationId, UUID id, UpdateFarmRequest request) {
        Farm farm = findScopedFarm(id, organizationId);
        farm.setName(request.getName().trim());
        farm.setLocation(trimToNull(request.getLocation()));

        return farmMapper.toResponse(farmRepository.save(farm));
    }

    @Override
    @Transactional
    public void deleteFarm(UUID organizationId, UUID id) {
        Farm farm = findScopedFarm(id, organizationId);

        if (fieldRepository.existsByFarmId(id)) {
            throw new ConflictException("Farm %s cannot be deleted while fields still exist".formatted(id));
        }

        farmRepository.delete(farm);
    }

    private Farm findScopedFarm(UUID id, UUID organizationId) {
        ensureOrganizationExists(organizationId);

        return farmRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Farm %s was not found for organization %s".formatted(id, organizationId)
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
