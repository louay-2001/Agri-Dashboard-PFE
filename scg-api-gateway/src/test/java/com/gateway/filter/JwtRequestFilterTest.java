package com.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtRequestFilterTest {

    private static final String JWT_SECRET = "jwtPFESecretKeyMustBeLongerThan32BytesForSecurityReasons";

    private JwtRequestFilter jwtRequestFilter;

    @BeforeEach
    void setUp() {
        jwtRequestFilter = new JwtRequestFilter();
        ReflectionTestUtils.setField(jwtRequestFilter, "jwtSecret", JWT_SECRET);
    }

    @Test
    void publicAuthPathBypassesJwtValidation() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/auth/signin").build()
        );
        CapturingGatewayFilterChain chain = new CapturingGatewayFilterChain();

        jwtRequestFilter.filter(exchange, chain).block();

        assertThat(chain.invoked).isTrue();
        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void protectedAgroPathRequiresBearerToken() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/agro/organizations").build()
        );
        CapturingGatewayFilterChain chain = new CapturingGatewayFilterChain();

        jwtRequestFilter.filter(exchange, chain).block();

        assertThat(chain.invoked).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void protectedAgritechPathForwardsValidatedClaims() {
        UUID organizationId = UUID.randomUUID();
        String token = generateToken(42L, "admin@example.com", organizationId, "admin");

        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/devices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .header("X-User-Organization-Id", "spoofed")
                        .build()
        );
        CapturingGatewayFilterChain chain = new CapturingGatewayFilterChain();

        jwtRequestFilter.filter(exchange, chain).block();

        assertThat(chain.invoked).isTrue();
        ServerHttpRequest forwardedRequest = chain.exchange.getRequest();

        assertThat(forwardedRequest.getHeaders().getFirst("X-Auth-Validated")).isEqualTo("true");
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Id")).isEqualTo("42");
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Email")).isEqualTo("admin@example.com");
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Name")).isEqualTo("admin@example.com");
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Organization-Id")).isEqualTo(organizationId.toString());
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Role")).isEqualTo("admin");
        assertThat(forwardedRequest.getHeaders().getFirst("X-User-Roles")).isEqualTo("ROLE_ADMIN");
    }

    private String generateToken(Long userId, String email, UUID organizationId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("organizationId", organizationId.toString())
                .claim("role", role)
                .claim("roles", "ROLE_" + role.toUpperCase())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private static final class CapturingGatewayFilterChain implements GatewayFilterChain {
        private boolean invoked;
        private ServerWebExchange exchange;

        @Override
        public Mono<Void> filter(ServerWebExchange exchange) {
            this.invoked = true;
            this.exchange = exchange;
            return Mono.empty();
        }
    }
}
