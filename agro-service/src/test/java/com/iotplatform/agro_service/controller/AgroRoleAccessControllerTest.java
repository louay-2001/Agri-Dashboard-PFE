package com.iotplatform.agro_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iotplatform.agro_service.dto.CreateFarmRequest;
import com.iotplatform.agro_service.dto.CreateFieldRequest;
import com.iotplatform.agro_service.dto.CreateOrganizationRequest;
import com.iotplatform.agro_service.dto.CreateSubscriptionPlanRequest;
import com.iotplatform.agro_service.dto.FieldResponse;
import com.iotplatform.agro_service.dto.FarmResponse;
import com.iotplatform.agro_service.dto.SubscriptionPlanResponse;
import com.iotplatform.agro_service.service.FarmService;
import com.iotplatform.agro_service.service.FieldService;
import com.iotplatform.agro_service.service.OrganizationService;
import com.iotplatform.agro_service.service.SubscriptionPlanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({OrganizationController.class, FarmController.class, FieldController.class, SubscriptionPlanController.class})
class AgroRoleAccessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrganizationService organizationService;

    @MockBean
    private FarmService farmService;

    @MockBean
    private FieldService fieldService;

    @MockBean
    private SubscriptionPlanService subscriptionPlanService;

    @Test
    void createOrganizationRejectsManagerRole() throws Exception {
        CreateOrganizationRequest request = new CreateOrganizationRequest("Demo Org", null);

        mockMvc.perform(post("/api/agro/organizations")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("The 'manager' role cannot perform this operation. Allowed roles: admin."));

        verifyNoInteractions(organizationService);
    }

    @Test
    void createFarmRejectsViewerRole() throws Exception {
        CreateFarmRequest request = new CreateFarmRequest(UUID.randomUUID(), "North Farm", "Tunis");

        mockMvc.perform(post("/api/agro/farms")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "viewer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("The 'viewer' role cannot perform this operation. Allowed roles: admin, manager."));

        verifyNoInteractions(farmService);
    }

    @Test
    void createFarmAllowsManagerRole() throws Exception {
        UUID organizationId = UUID.randomUUID();
        UUID farmId = UUID.randomUUID();
        CreateFarmRequest request = new CreateFarmRequest(organizationId, "North Farm", "Tunis");
        FarmResponse response = FarmResponse.builder()
                .id(farmId)
                .organizationId(organizationId)
                .name("North Farm")
                .location("Tunis")
                .createdAt(Instant.parse("2026-04-22T11:00:00Z"))
                .build();

        when(farmService.createFarm(any(CreateFarmRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/agro/farms")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(farmId.toString()))
                .andExpect(jsonPath("$.organizationId").value(organizationId.toString()))
                .andExpect(jsonPath("$.name").value("North Farm"));
    }

    @Test
    void createFieldRejectsViewerRole() throws Exception {
        CreateFieldRequest request = new CreateFieldRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Alpha Field",
                "Wheat",
                BigDecimal.valueOf(12.50)
        );

        mockMvc.perform(post("/api/agro/fields")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "viewer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("The 'viewer' role cannot perform this operation. Allowed roles: admin, manager."));

        verifyNoInteractions(fieldService);
    }

    @Test
    void createFieldAllowsManagerRole() throws Exception {
        UUID organizationId = UUID.randomUUID();
        UUID farmId = UUID.randomUUID();
        UUID fieldId = UUID.randomUUID();
        CreateFieldRequest request = new CreateFieldRequest(
                organizationId,
                farmId,
                "Alpha Field",
                "Wheat",
                BigDecimal.valueOf(12.50)
        );
        FieldResponse response = FieldResponse.builder()
                .id(fieldId)
                .organizationId(organizationId)
                .farmId(farmId)
                .name("Alpha Field")
                .cropType("Wheat")
                .areaHectare(BigDecimal.valueOf(12.50))
                .createdAt(Instant.parse("2026-04-24T09:00:00Z"))
                .build();

        when(fieldService.createField(any(CreateFieldRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/agro/fields")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(fieldId.toString()))
                .andExpect(jsonPath("$.organizationId").value(organizationId.toString()))
                .andExpect(jsonPath("$.farmId").value(farmId.toString()))
                .andExpect(jsonPath("$.name").value("Alpha Field"));
    }

    @Test
    void createSubscriptionPlanRejectsManagerRole() throws Exception {
        CreateSubscriptionPlanRequest request = new CreateSubscriptionPlanRequest(
                "BASIC", "Basic", "Starter plan", 25, 10, java.math.BigDecimal.valueOf(19.99), true
        );

        mockMvc.perform(post("/api/agro/subscription-plans")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "manager")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("The 'manager' role cannot perform this operation. Allowed roles: admin."));

        verifyNoInteractions(subscriptionPlanService);
    }

    @Test
    void createSubscriptionPlanAllowsAdminRole() throws Exception {
        UUID planId = UUID.randomUUID();
        CreateSubscriptionPlanRequest request = new CreateSubscriptionPlanRequest(
                "BASIC", "Basic", "Starter plan", 25, 10, java.math.BigDecimal.valueOf(19.99), true
        );
        SubscriptionPlanResponse response = SubscriptionPlanResponse.builder()
                .id(planId)
                .code("BASIC")
                .name("Basic")
                .description("Starter plan")
                .deviceLimit(25)
                .fieldLimit(10)
                .priceMonthly(java.math.BigDecimal.valueOf(19.99))
                .active(true)
                .createdAt(Instant.parse("2026-04-22T10:00:00Z"))
                .build();

        when(subscriptionPlanService.createSubscriptionPlan(any(CreateSubscriptionPlanRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/agro/subscription-plans")
                        .header("X-Auth-Validated", "true")
                        .header("X-User-Role", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(planId.toString()))
                .andExpect(jsonPath("$.code").value("BASIC"))
                .andExpect(jsonPath("$.name").value("Basic"));
    }
}
