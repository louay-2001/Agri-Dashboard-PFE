package com.iotplatform.auth_service.security;

import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.model.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private static final String JWT_SECRET = "jwtPFESecretKeyMustBeLongerThan32BytesForSecurityReasons";

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", JWT_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", 60000);
    }

    @Test
    void generateTokenIncludesTenantClaims() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();
        User user = new User();
        user.setEmail("manager@example.com");
        user.setOrganizationId(organizationId);
        user.setRole(UserRole.MANAGER);

        java.lang.reflect.Field idField = User.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, userId);

        String token = jwtUtils.generateToken(user);
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertThat(claims.getSubject()).isEqualTo("manager@example.com");
        assertThat(claims.get("userId", String.class)).isEqualTo(userId.toString());
        assertThat(claims.get("organizationId", String.class)).isEqualTo(organizationId.toString());
        assertThat(claims.get("role", String.class)).isEqualTo("manager");
        assertThat(claims.get("roles", String.class)).isEqualTo("ROLE_MANAGER");
    }
}
