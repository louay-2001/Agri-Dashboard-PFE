package com.iotplatform.auth_service.payload.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.iotplatform.auth_service.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class SignupRequest {
    @JsonAlias("name")
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private UUID organizationId;

    @NotNull(message = "Role is required")
    private UserRole role;

    public SignupRequest() {
    }

    public SignupRequest(String email, String password, UUID organizationId, UserRole role) {
        this.email = email;
        this.password = password;
        this.organizationId = organizationId;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
