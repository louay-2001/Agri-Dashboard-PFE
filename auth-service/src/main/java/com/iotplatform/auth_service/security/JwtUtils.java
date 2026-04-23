package com.iotplatform.auth_service.security;

import com.iotplatform.auth_service.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${pfe.app.jwtSecret}")
    private String jwtSecret;

    @Value("${pfe.app.jwtExpiration}")
    private int jwtExpiration;

    public String generateToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId() != null ? user.getId().toString() : null)
                .claim("organizationId", user.getOrganizationId() != null ? user.getOrganizationId().toString() : null)
                .claim("role", user.getRole() != null ? user.getRole().getValue() : null)
                .claim("roles", user.getRole() != null ? user.getRole().getAuthority() : null)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
