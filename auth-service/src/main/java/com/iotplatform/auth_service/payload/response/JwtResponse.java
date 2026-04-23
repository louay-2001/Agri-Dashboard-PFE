package com.iotplatform.auth_service.payload.response;

import java.util.UUID;

public class JwtResponse {
    private final String token;
    private final String type;
    private final UUID userId;
    private final String email;
    private final String username;
    private final UUID organizationId;
    private final String role;

    public JwtResponse(String token, String type, UUID userId, String email, String username, UUID organizationId, String role) {
        this.token = token;
        this.type = type;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.organizationId = organizationId;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getRole() {
        return role;
    }
}
