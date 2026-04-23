package com.iotplatform.device_service.service.impl;

import com.iotplatform.device_service.client.AgroFieldClient;
import com.iotplatform.device_service.dto.CreateDeviceRequest;
import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.DeviceResponse;
import com.iotplatform.device_service.dto.UpdateDeviceRequest;
import com.iotplatform.device_service.entity.Device;
import com.iotplatform.device_service.exception.BadRequestException;
import com.iotplatform.device_service.exception.ConflictException;
import com.iotplatform.device_service.exception.DeviceNotFoundException;
import com.iotplatform.device_service.mapper.DeviceMapper;
import com.iotplatform.device_service.repository.DeviceRepository;
import com.iotplatform.device_service.service.DeviceService;
import com.iotplatform.device_service.util.DeviceIdentifierGenerator;
import com.iotplatform.device_service.util.DeviceSecretGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private static final int MAX_IDENTIFIER_ATTEMPTS = 10;

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;
    private final DeviceIdentifierGenerator deviceIdentifierGenerator;
    private final DeviceSecretGenerator deviceSecretGenerator;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AgroFieldClient agroFieldClient;

    @Override
    @Transactional
    public CreateDeviceResponse createDevice(CreateDeviceRequest request) {
        agroFieldClient.validateFieldOwnership(request.getOrganizationId(), request.getFieldId());

        String rawSecret = deviceSecretGenerator.generate();
        Device device = new Device();
        device.setFieldId(request.getFieldId());
        device.setOrganizationId(request.getOrganizationId());
        device.setFirmwareVersion(request.getFirmwareVersion());
        device.setDeviceSecretHash(bCryptPasswordEncoder.encode(rawSecret));
        device.setDeviceIdentifier(generateUniqueIdentifier());

        try {
            Device savedDevice = deviceRepository.saveAndFlush(device);
            return deviceMapper.toCreateDeviceResponse(savedDevice, rawSecret);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Unable to create device because a unique constraint was violated");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeviceResponse> getDevices(UUID organizationId, Pageable pageable) {
        return deviceRepository.findByOrganizationId(organizationId, pageable)
                .map(deviceMapper::toDeviceResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceResponse getDevice(UUID organizationId, UUID id) {
        return deviceMapper.toDeviceResponse(findScopedDevice(id, organizationId));
    }

    @Override
    @Transactional
    public DeviceResponse updateDevice(UUID organizationId, UUID id, UpdateDeviceRequest request) {
        if (request.getFieldId() == null && request.getFirmwareVersion() == null && request.getStatus() == null) {
            throw new BadRequestException("At least one updatable field must be provided");
        }

        Device device = findScopedDevice(id, organizationId);

        if (request.getFieldId() != null) {
            agroFieldClient.validateFieldOwnership(organizationId, request.getFieldId());
            device.setFieldId(request.getFieldId());
        }
        if (request.getFirmwareVersion() != null) {
            device.setFirmwareVersion(request.getFirmwareVersion());
        }
        if (request.getStatus() != null) {
            device.setStatus(request.getStatus());
        }

        Device updatedDevice = deviceRepository.save(device);
        return deviceMapper.toDeviceResponse(updatedDevice);
    }

    @Override
    @Transactional
    public void deleteDevice(UUID organizationId, UUID id) {
        Device device = findScopedDevice(id, organizationId);
        deviceRepository.delete(device);
    }

    private Device findScopedDevice(UUID id, UUID organizationId) {
        return deviceRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new DeviceNotFoundException(
                        "Device %s was not found for organization %s".formatted(id, organizationId)
                ));
    }

    private String generateUniqueIdentifier() {
        for (int attempt = 0; attempt < MAX_IDENTIFIER_ATTEMPTS; attempt++) {
            String candidate = deviceIdentifierGenerator.generate();
            if (!deviceRepository.existsByDeviceIdentifier(candidate)) {
                return candidate;
            }
        }

        throw new ConflictException("Unable to allocate a unique device identifier");
    }
}
