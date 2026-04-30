package com.iotplatform.auth_service.service;

import com.iotplatform.auth_service.client.OrganizationDirectoryClient;
import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.model.UserRole;
import com.iotplatform.auth_service.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OrganizationDirectoryClient organizationDirectoryClient;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void authenticateReturnsUserWhenPasswordHashMatches() {
        User user = buildUser();
        user.setPasswordHash("$2a$10$hash");

        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "$2a$10$hash")).thenReturn(true);

        Optional<User> authenticatedUser = authService.authenticate("Admin@Example.com", "secret123");

        assertTrue(authenticatedUser.isPresent());
        assertEquals("admin@example.com", authenticatedUser.get().getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUpgradesLegacyPlainTextPassword() {
        User user = buildUser();
        user.setPasswordHash("legacy-plain-text");

        when(userRepository.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("legacy-plain-text", "legacy-plain-text")).thenReturn(false);
        when(passwordEncoder.encode("legacy-plain-text")).thenReturn("$2a$10$rehashed");

        Optional<User> authenticatedUser = authService.authenticate("admin@example.com", "legacy-plain-text");

        assertTrue(authenticatedUser.isPresent());
        assertEquals("$2a$10$rehashed", authenticatedUser.get().getPasswordHash());
        verify(userRepository).save(user);
    }

    @Test
    void registerUserStoresNormalizedEmailHashedPasswordAndTenantFields() {
        UUID organizationId = UUID.randomUUID();

        when(organizationDirectoryClient.existsById(organizationId)).thenReturn(true);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = authService.registerUser("Manager@Example.com", "secret123", organizationId, UserRole.MANAGER);

        assertEquals("manager@example.com", createdUser.getEmail());
        assertEquals("$2a$10$encoded", createdUser.getPasswordHash());
        assertEquals(organizationId, createdUser.getOrganizationId());
        assertEquals(UserRole.MANAGER, createdUser.getRole());
    }

    @Test
    void registerViewerUserStoresNormalizedEmailHashedPasswordAndTenantFields() {
        UUID organizationId = UUID.randomUUID();

        when(organizationDirectoryClient.existsById(organizationId)).thenReturn(true);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = authService.registerUser("Viewer@Example.com", "secret123", organizationId, UserRole.VIEWER);

        assertEquals("viewer@example.com", createdUser.getEmail());
        assertEquals("$2a$10$encoded", createdUser.getPasswordHash());
        assertEquals(organizationId, createdUser.getOrganizationId());
        assertEquals(UserRole.VIEWER, createdUser.getRole());
    }

    @Test
    void registerAdminUserStoresNullOrganizationId() {
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = authService.registerUser("Admin@Example.com", "secret123", UUID.randomUUID(), UserRole.ADMIN);

        assertEquals("admin@example.com", createdUser.getEmail());
        assertEquals("$2a$10$encoded", createdUser.getPasswordHash());
        assertNull(createdUser.getOrganizationId());
        assertEquals(UserRole.ADMIN, createdUser.getRole());
        verify(organizationDirectoryClient, never()).existsById(any(UUID.class));
    }

    @Test
    void registerManagerUserRejectsMissingOrganization() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.registerUser("Manager@Example.com", "secret123", null, UserRole.MANAGER));

        assertEquals("organizationId is required for MANAGER and VIEWER", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(organizationDirectoryClient, never()).existsById(any(UUID.class));
    }

    @Test
    void registerViewerUserRejectsMissingOrganization() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.registerUser("Viewer@Example.com", "secret123", null, UserRole.VIEWER));

        assertEquals("organizationId is required for MANAGER and VIEWER", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(organizationDirectoryClient, never()).existsById(any(UUID.class));
    }

    @Test
    void registerUserRejectsUnknownOrganization() {
        UUID organizationId = UUID.randomUUID();
        when(organizationDirectoryClient.existsById(organizationId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.registerUser("Manager@Example.com", "secret123", organizationId, UserRole.MANAGER));

        assertEquals("Organization %s does not exist".formatted(organizationId), exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerViewerUserRejectsUnknownOrganization() {
        UUID organizationId = UUID.randomUUID();
        when(organizationDirectoryClient.existsById(organizationId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.registerUser("Viewer@Example.com", "secret123", organizationId, UserRole.VIEWER));

        assertEquals("Organization %s does not exist".formatted(organizationId), exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    private User buildUser() {
        User user = new User();
        user.setEmail("admin@example.com");
        user.setOrganizationId(UUID.randomUUID());
        user.setRole(UserRole.ADMIN);
        return user;
    }
}
