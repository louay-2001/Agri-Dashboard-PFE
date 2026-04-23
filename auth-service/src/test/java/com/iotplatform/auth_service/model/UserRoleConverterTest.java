package com.iotplatform.auth_service.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class UserRoleConverterTest {

    private final UserRoleConverter converter = new UserRoleConverter();

    @Test
    void convertToDatabaseColumnUsesLowercaseRoleValue() {
        assertEquals("admin", converter.convertToDatabaseColumn(UserRole.ADMIN));
        assertEquals("manager", converter.convertToDatabaseColumn(UserRole.MANAGER));
        assertEquals("viewer", converter.convertToDatabaseColumn(UserRole.VIEWER));
        assertNull(converter.convertToDatabaseColumn(null));
    }

    @Test
    void convertToEntityAttributeResolvesStoredLowercaseValue() {
        assertEquals(UserRole.ADMIN, converter.convertToEntityAttribute("admin"));
        assertEquals(UserRole.MANAGER, converter.convertToEntityAttribute("manager"));
        assertEquals(UserRole.VIEWER, converter.convertToEntityAttribute("viewer"));
        assertNull(converter.convertToEntityAttribute(null));
    }
}
