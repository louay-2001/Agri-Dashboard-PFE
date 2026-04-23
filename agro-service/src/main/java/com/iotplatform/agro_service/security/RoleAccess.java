package com.iotplatform.agro_service.security;

import com.iotplatform.agro_service.exception.ForbiddenOperationException;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Arrays;
import java.util.stream.Collectors;

public final class RoleAccess {

    public static final String AUTH_VALIDATED_HEADER = "X-Auth-Validated";
    public static final String USER_ROLE_HEADER = "X-User-Role";

    private RoleAccess() {
    }

    public static void requireAdmin(HttpServletRequest request) {
        requireAny(request, UserRole.ADMIN);
    }

    public static void requireManagerOrAdmin(HttpServletRequest request) {
        requireAny(request, UserRole.ADMIN, UserRole.MANAGER);
    }

    private static void requireAny(HttpServletRequest request, UserRole... allowedRoles) {
        if (!"true".equalsIgnoreCase(normalize(request.getHeader(AUTH_VALIDATED_HEADER)))) {
            throw new ForbiddenOperationException("This operation requires an authenticated gateway request.");
        }

        UserRole currentRole = resolveRole(request.getHeader(USER_ROLE_HEADER));
        boolean allowed = Arrays.stream(allowedRoles).anyMatch(role -> role == currentRole);

        if (!allowed) {
            String allowedValues = Arrays.stream(allowedRoles)
                    .map(UserRole::getValue)
                    .collect(Collectors.joining(", "));
            throw new ForbiddenOperationException(
                    "The '%s' role cannot perform this operation. Allowed roles: %s."
                            .formatted(currentRole.getValue(), allowedValues)
            );
        }
    }

    private static UserRole resolveRole(String roleHeader) {
        String normalizedRole = normalize(roleHeader);

        if (normalizedRole.isBlank()) {
            throw new ForbiddenOperationException("A validated user role is required for this operation.");
        }

        try {
            return UserRole.fromValue(normalizedRole);
        } catch (IllegalArgumentException exception) {
            throw new ForbiddenOperationException("Unsupported user role: " + normalizedRole);
        }
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
