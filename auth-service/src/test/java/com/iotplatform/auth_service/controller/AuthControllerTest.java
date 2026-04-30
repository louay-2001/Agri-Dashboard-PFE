package com.iotplatform.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iotplatform.auth_service.config.SecurityConfig;
import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.model.UserRole;
import com.iotplatform.auth_service.security.JwtUtils;
import com.iotplatform.auth_service.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    void signinReturnsJwtResponseWithTenantContext() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        User user = new User();
        user.setEmail("admin@example.com");
        user.setOrganizationId(organizationId);
        user.setRole(UserRole.ADMIN);

        java.lang.reflect.Field idField = User.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, userId);

        when(authService.authenticate("admin@example.com", "secret123")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@example.com",
                                "password", "secret123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.username").value("admin@example.com"))
                .andExpect(jsonPath("$.organizationId").value(organizationId.toString()))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    void signinAcceptsLegacyNameAliasForEmail() throws Exception {
        User user = new User();
        user.setEmail("viewer@example.com");
        user.setOrganizationId(UUID.randomUUID());
        user.setRole(UserRole.VIEWER);

        when(authService.authenticate("viewer@example.com", "secret123")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "viewer@example.com",
                                "password", "secret123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("viewer@example.com"));
    }

    @Test
    void signupRejectsDuplicateEmail() throws Exception {
        UUID organizationId = UUID.randomUUID();
        when(authService.userExists("manager@example.com")).thenReturn(true);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "manager@example.com",
                                "password", "secret123",
                                "organizationId", organizationId,
                                "role", "manager"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User already exists for this email"));

        verify(authService, never()).registerUser(any(), any(), any(), any());
    }

    @Test
    void signupRegistersTenantAwareUser() throws Exception {
        UUID organizationId = UUID.randomUUID();
        when(authService.userExists("manager@example.com")).thenReturn(false);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "manager@example.com",
                                "password", "secret123",
                                "organizationId", organizationId,
                                "role", "manager"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        verify(authService).registerUser(eq("manager@example.com"), eq("secret123"), eq(organizationId), eq(UserRole.MANAGER));
    }

    @Test
    void signupRejectsUnknownOrganization() throws Exception {
        UUID organizationId = UUID.randomUUID();
        when(authService.userExists("manager@example.com")).thenReturn(false);
        doThrow(new IllegalArgumentException("Organization %s does not exist".formatted(organizationId)))
                .when(authService)
                .registerUser("manager@example.com", "secret123", organizationId, UserRole.MANAGER);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "manager@example.com",
                                "password", "secret123",
                                "organizationId", organizationId,
                                "role", "manager"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Organization %s does not exist".formatted(organizationId)));
    }
}
