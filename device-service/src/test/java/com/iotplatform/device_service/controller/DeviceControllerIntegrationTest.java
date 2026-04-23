package com.iotplatform.device_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iotplatform.device_service.dto.CreateDeviceRequest;
import com.iotplatform.device_service.dto.CreateDeviceResponse;
import com.iotplatform.device_service.dto.DeviceResponse;
import com.iotplatform.device_service.dto.UpdateDeviceRequest;
import com.iotplatform.device_service.enums.DeviceStatus;
import com.iotplatform.device_service.exception.FieldOwnershipNotFoundException;
import com.iotplatform.device_service.service.DeviceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeviceController.class)
class DeviceControllerIntegrationTest {

    private static final String AUTH_VALIDATED_HEADER = "X-Auth-Validated";
    private static final String USER_ROLE_HEADER = "X-User-Role";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeviceService deviceService;

    @Test
    void createDeviceReturnsCreatedResponse() throws Exception {
        UUID fieldId = UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71");
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");
        UUID deviceId = UUID.fromString("0f311dbd-6fb5-4f8f-8e53-3c96f996818f");

        CreateDeviceRequest request = new CreateDeviceRequest(fieldId, organizationId, "1.0.0");
        CreateDeviceResponse response = CreateDeviceResponse.builder()
                .id(deviceId)
                .fieldId(fieldId)
                .organizationId(organizationId)
                .deviceIdentifier("DEV-7A19C3F2")
                .rawDeviceSecret("plain-secret")
                .firmwareVersion("1.0.0")
                .status(DeviceStatus.ACTIVE)
                .createdAt(Instant.parse("2026-04-18T09:30:00Z"))
                .build();

        when(deviceService.createDevice(any(CreateDeviceRequest.class))).thenReturn(response);

        mockMvc.perform(post("/devices")
                        .header(AUTH_VALIDATED_HEADER, "true")
                        .header(USER_ROLE_HEADER, "manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(deviceId.toString()))
                .andExpect(jsonPath("$.deviceIdentifier").value("DEV-7A19C3F2"))
                .andExpect(jsonPath("$.rawDeviceSecret").value("plain-secret"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void createDeviceReturnsNotFoundWhenFieldOwnershipValidationFails() throws Exception {
        UUID fieldId = UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71");
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");

        CreateDeviceRequest request = new CreateDeviceRequest(fieldId, organizationId, "1.0.0");

        when(deviceService.createDevice(any(CreateDeviceRequest.class)))
                .thenThrow(new FieldOwnershipNotFoundException(
                        "Field %s was not found for organization %s".formatted(fieldId, organizationId)
                ));

        mockMvc.perform(post("/devices")
                        .header(AUTH_VALIDATED_HEADER, "true")
                        .header(USER_ROLE_HEADER, "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Field %s was not found for organization %s".formatted(fieldId, organizationId)));
    }

    @Test
    void createDeviceRejectsViewerRole() throws Exception {
        CreateDeviceRequest request = new CreateDeviceRequest(
                UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71"),
                UUID.fromString("11111111-2222-3333-4444-555555555555"),
                "1.0.0"
        );

        mockMvc.perform(post("/devices")
                        .header(AUTH_VALIDATED_HEADER, "true")
                        .header(USER_ROLE_HEADER, "viewer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("The 'viewer' role cannot perform this operation. Allowed roles: admin, manager."));

        verifyNoInteractions(deviceService);
    }

    @Test
    void getDeviceByIdReturnsScopedDevice() throws Exception {
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");
        UUID deviceId = UUID.fromString("0f311dbd-6fb5-4f8f-8e53-3c96f996818f");

        DeviceResponse response = DeviceResponse.builder()
                .id(deviceId)
                .fieldId(UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71"))
                .organizationId(organizationId)
                .deviceIdentifier("DEV-7A19C3F2")
                .firmwareVersion("1.0.0")
                .status(DeviceStatus.ACTIVE)
                .createdAt(Instant.parse("2026-04-18T09:30:00Z"))
                .build();

        when(deviceService.getDevice(organizationId, deviceId)).thenReturn(response);

        mockMvc.perform(get("/devices/{id}", deviceId)
                        .param("organizationId", organizationId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(deviceId.toString()))
                .andExpect(jsonPath("$.organizationId").value(organizationId.toString()))
                .andExpect(jsonPath("$.deviceIdentifier").value("DEV-7A19C3F2"));
    }

    @Test
    void listDevicesReturnsPageContent() throws Exception {
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");

        DeviceResponse firstDevice = DeviceResponse.builder()
                .id(UUID.fromString("0f311dbd-6fb5-4f8f-8e53-3c96f996818f"))
                .fieldId(UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71"))
                .organizationId(organizationId)
                .deviceIdentifier("DEV-7A19C3F2")
                .firmwareVersion("1.0.0")
                .status(DeviceStatus.ACTIVE)
                .createdAt(Instant.parse("2026-04-18T09:30:00Z"))
                .build();

        DeviceResponse secondDevice = DeviceResponse.builder()
                .id(UUID.fromString("14444dbd-6fb5-4f8f-8e53-3c96f996818f"))
                .fieldId(UUID.fromString("4b23b12f-f1d1-4efd-89bb-f64384c68c72"))
                .organizationId(organizationId)
                .deviceIdentifier("DEV-91FF20AA")
                .firmwareVersion("1.1.0")
                .status(DeviceStatus.INACTIVE)
                .createdAt(Instant.parse("2026-04-18T10:00:00Z"))
                .build();

        when(deviceService.getDevices(eq(organizationId), any()))
                .thenReturn(new PageImpl<>(List.of(firstDevice, secondDevice), PageRequest.of(0, 2), 2));

        mockMvc.perform(get("/devices")
                        .param("organizationId", organizationId.toString())
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].deviceIdentifier").value("DEV-7A19C3F2"))
                .andExpect(jsonPath("$.content[1].deviceIdentifier").value("DEV-91FF20AA"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(2));
    }

    @Test
    void updateDeviceRejectsViewerRole() throws Exception {
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");
        UUID deviceId = UUID.fromString("0f311dbd-6fb5-4f8f-8e53-3c96f996818f");
        UpdateDeviceRequest request = new UpdateDeviceRequest(
                UUID.fromString("3a23b12f-f1d1-4efd-89bb-f64384c68c71"),
                "1.0.1",
                DeviceStatus.ACTIVE
        );

        mockMvc.perform(put("/devices/{id}", deviceId)
                        .header(AUTH_VALIDATED_HEADER, "true")
                        .header(USER_ROLE_HEADER, "viewer")
                        .param("organizationId", organizationId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(deviceService);
    }

    @Test
    void deleteDeviceRejectsViewerRole() throws Exception {
        UUID organizationId = UUID.fromString("11111111-2222-3333-4444-555555555555");
        UUID deviceId = UUID.fromString("0f311dbd-6fb5-4f8f-8e53-3c96f996818f");

        mockMvc.perform(delete("/devices/{id}", deviceId)
                        .header(AUTH_VALIDATED_HEADER, "true")
                        .header(USER_ROLE_HEADER, "viewer")
                        .param("organizationId", organizationId.toString()))
                .andExpect(status().isForbidden());

        verifyNoInteractions(deviceService);
    }
}
