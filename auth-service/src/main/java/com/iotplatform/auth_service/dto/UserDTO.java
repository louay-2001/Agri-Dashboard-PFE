// src/main/java/com/iotplatform/auth_service/dto/UserDTO.java
package com.iotplatform.auth_service.dto;

import java.util.UUID;

public class UserDTO {
    private UUID id;
    private String email;
    private UUID organizationId;
    private String role;

    // Getters & Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
