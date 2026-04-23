package com.iotplatform.device_service.security;

import java.util.Arrays;

public enum UserRole {
    ADMIN("admin"),
    MANAGER("manager"),
    VIEWER("viewer");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        return Arrays.stream(values())
                .filter(role -> role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported role: " + value));
    }
}
