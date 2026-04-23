package com.iotplatform.device_service.service.impl;

import com.iotplatform.device_service.client.AgroFieldClient;
import com.iotplatform.device_service.dto.CreateDeviceRequest;
import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.UpdateDeviceRequest;
import com.iotplatform.device_service.entity.Device;
import com.iotplatform.device_service.enums.DeviceStatus;
import com.iotplatform.device_service.exception.BadRequestException;
import com.iotplatform.device_service.exception.DeviceNotFoundException;
import com.iotplatform.device_service.exception.FieldOwnershipNotFoundException;
import com.iotplatform.device_service.mapper.DeviceMapper;
import com.iotplatform.device_service.repository.DeviceRepository;
import com.iotplatform.device_service.util.DeviceIdentifierGenerator;
import com.iotplatform.device_service.util.DeviceSecretGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceServiceImplTest {

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private DeviceIdentifierGenerator deviceIdentifierGenerator;

    @Mock
    private DeviceSecretGenerator deviceSecretGenerator;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    private AgroFieldClient agroFieldClient;

    private DeviceServiceImpl deviceService;

    @BeforeEach
    void setUp() {
        deviceService = new DeviceServiceImpl(
                deviceRepository,
                new DeviceMapper(),
                deviceIdentifierGenerator,
                deviceSecretGenerator,
                bCryptPasswordEncoder,
                agroFieldClient
        );
    }

    @Test
    void createDeviceHashesSecretAndReturnsRawSecret() {
        UUID fieldId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-04-18T10:15:30Z");

        CreateDeviceRequest request = new CreateDeviceRequest(fieldId, organizationId, "1.0.0");

        when(deviceSecretGenerator.generate()).thenReturn("plain-secret");
        when(bCryptPasswordEncoder.encode("plain-secret")).thenReturn("hashed-secret");
        when(deviceIdentifierGenerator.generate()).thenReturn("DEV-ABC12345");
        when(deviceRepository.existsByDeviceIdentifier("DEV-ABC12345")).thenReturn(false);
        when(deviceRepository.saveAndFlush(any(Device.class))).thenAnswer(invocation -> {
            Device toSave = invocation.getArgument(0);
            Device saved = new Device();
            saved.setId(deviceId);
            saved.setFieldId(toSave.getFieldId());
            saved.setOrganizationId(toSave.getOrganizationId());
            saved.setDeviceIdentifier(toSave.getDeviceIdentifier());
            saved.setDeviceSecretHash(toSave.getDeviceSecretHash());
            saved.setFirmwareVersion(toSave.getFirmwareVersion());
            saved.setStatus(DeviceStatus.ACTIVE);
            saved.setCreatedAt(createdAt);
            return saved;
        });

        CreateDeviceResponse response = deviceService.createDevice(request);

        ArgumentCaptor<Device> deviceCaptor = ArgumentCaptor.forClass(Device.class);
        verify(deviceRepository).saveAndFlush(deviceCaptor.capture());
        verify(agroFieldClient).validateFieldOwnership(organizationId, fieldId);

        Device persistedDevice = deviceCaptor.getValue();
        assertThat(persistedDevice.getDeviceIdentifier()).isEqualTo("DEV-ABC12345");
        assertThat(persistedDevice.getDeviceSecretHash()).isEqualTo("hashed-secret");
        assertThat(persistedDevice.getDeviceSecretHash()).isNotEqualTo("plain-secret");

        assertThat(response.getId()).isEqualTo(deviceId);
        assertThat(response.getDeviceIdentifier()).isEqualTo("DEV-ABC12345");
        assertThat(response.getRawDeviceSecret()).isEqualTo("plain-secret");
        assertThat(response.getStatus()).isEqualTo(DeviceStatus.ACTIVE);
    }

    @Test
    void createDeviceRetriesWhenGeneratedIdentifierAlreadyExists() {
        CreateDeviceRequest request = new CreateDeviceRequest(UUID.randomUUID(), UUID.randomUUID(), "1.0.1");

        when(deviceSecretGenerator.generate()).thenReturn("plain-secret");
        when(bCryptPasswordEncoder.encode("plain-secret")).thenReturn("hashed-secret");
        when(deviceIdentifierGenerator.generate()).thenReturn("DEV-DUPL000", "DEV-UNIQ000");
        when(deviceRepository.existsByDeviceIdentifier("DEV-DUPL000")).thenReturn(true);
        when(deviceRepository.existsByDeviceIdentifier("DEV-UNIQ000")).thenReturn(false);
        when(deviceRepository.saveAndFlush(any(Device.class))).thenAnswer(invocation -> {
            Device toSave = invocation.getArgument(0);
            toSave.setId(UUID.randomUUID());
            toSave.setStatus(DeviceStatus.ACTIVE);
            toSave.setCreatedAt(Instant.now());
            return toSave;
        });

        CreateDeviceResponse response = deviceService.createDevice(request);

        assertThat(response.getDeviceIdentifier()).isEqualTo("DEV-UNIQ000");
        verify(deviceIdentifierGenerator, times(2)).generate();
    }

    @Test
    void createDeviceStopsWhenFieldDoesNotBelongToOrganization() {
        UUID fieldId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        CreateDeviceRequest request = new CreateDeviceRequest(fieldId, organizationId, "1.0.0");

        doThrow(new FieldOwnershipNotFoundException("Field not found for organization"))
                .when(agroFieldClient)
                .validateFieldOwnership(organizationId, fieldId);

        assertThatThrownBy(() -> deviceService.createDevice(request))
                .isInstanceOf(FieldOwnershipNotFoundException.class)
                .hasMessage("Field not found for organization");

        verify(deviceRepository, never()).saveAndFlush(any(Device.class));
    }

    @Test
    void getDevicesReturnsMappedPage() {
        UUID organizationId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();
        Device device = new Device();
        device.setId(deviceId);
        device.setFieldId(UUID.randomUUID());
        device.setOrganizationId(organizationId);
        device.setDeviceIdentifier("DEV-1234ABCD");
        device.setDeviceSecretHash("hashed");
        device.setFirmwareVersion("2.0.0");
        device.setStatus(DeviceStatus.INACTIVE);
        device.setCreatedAt(Instant.parse("2026-04-18T09:00:00Z"));

        when(deviceRepository.findByOrganizationId(organizationId, PageRequest.of(0, 5)))
                .thenReturn(new PageImpl<>(List.of(device), PageRequest.of(0, 5), 1));

        var result = deviceService.getDevices(organizationId, PageRequest.of(0, 5));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(deviceId);
        assertThat(result.getContent().get(0).getDeviceIdentifier()).isEqualTo("DEV-1234ABCD");
    }

    @Test
    void updateDeviceWithoutFieldsThrowsBadRequest() {
        assertThatThrownBy(() -> deviceService.updateDevice(UUID.randomUUID(), UUID.randomUUID(), new UpdateDeviceRequest()))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("At least one updatable field must be provided");
    }

    @Test
    void updateDeviceValidatesProvidedFieldOwnership() {
        UUID organizationId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();
        UUID fieldId = UUID.randomUUID();

        Device existingDevice = new Device();
        existingDevice.setId(deviceId);
        existingDevice.setOrganizationId(organizationId);
        existingDevice.setFieldId(UUID.randomUUID());
        existingDevice.setDeviceIdentifier("DEV-ABCD1234");
        existingDevice.setDeviceSecretHash("hashed");
        existingDevice.setStatus(DeviceStatus.ACTIVE);
        existingDevice.setCreatedAt(Instant.parse("2026-04-18T09:00:00Z"));

        UpdateDeviceRequest request = new UpdateDeviceRequest(fieldId, "2.1.0", DeviceStatus.SUSPENDED);

        when(deviceRepository.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.of(existingDevice));
        when(deviceRepository.save(any(Device.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = deviceService.updateDevice(organizationId, deviceId, request);

        verify(agroFieldClient).validateFieldOwnership(organizationId, fieldId);
        assertThat(response.getFieldId()).isEqualTo(fieldId);
        assertThat(response.getFirmwareVersion()).isEqualTo("2.1.0");
        assertThat(response.getStatus()).isEqualTo(DeviceStatus.SUSPENDED);
    }

    @Test
    void updateDeviceWithoutFieldChangeDoesNotCallAgroValidation() {
        UUID organizationId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();

        Device existingDevice = new Device();
        existingDevice.setId(deviceId);
        existingDevice.setOrganizationId(organizationId);
        existingDevice.setFieldId(UUID.randomUUID());
        existingDevice.setDeviceIdentifier("DEV-ABCD1234");
        existingDevice.setDeviceSecretHash("hashed");
        existingDevice.setStatus(DeviceStatus.ACTIVE);
        existingDevice.setCreatedAt(Instant.parse("2026-04-18T09:00:00Z"));

        UpdateDeviceRequest request = new UpdateDeviceRequest(null, "2.2.0", DeviceStatus.INACTIVE);

        when(deviceRepository.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.of(existingDevice));
        when(deviceRepository.save(any(Device.class))).thenAnswer(invocation -> invocation.getArgument(0));

        deviceService.updateDevice(organizationId, deviceId, request);

        verify(agroFieldClient, never()).validateFieldOwnership(any(UUID.class), any(UUID.class));
    }

    @Test
    void getDeviceThrowsWhenScopedDeviceIsMissing() {
        UUID organizationId = UUID.randomUUID();
        UUID deviceId = UUID.randomUUID();

        when(deviceRepository.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> deviceService.getDevice(organizationId, deviceId))
                .isInstanceOf(DeviceNotFoundException.class)
                .hasMessageContaining(deviceId.toString())
                .hasMessageContaining(organizationId.toString());
    }
}
