package com.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@Component
public class JwtRequestFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtRequestFilter.class);

    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth",
            "/actuator",
            "/api/agro/organizations/public"
    );

    private static final List<String> FORWARDED_IDENTITY_HEADERS = List.of(
            "X-Auth-Validated",
            "X-User-Id",
            "X-User-Email",
            "X-User-Name",
            "X-User-Organization-Id",
            "X-User-Role",
            "X-User-Roles"
    );

    @Value("${pfe.app.jwtSecret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = normalizeClaim(claims.getSubject());
            String userId = normalizeClaim(claims.get("userId"));
            String organizationId = normalizeClaim(claims.get("organizationId"));
            String role = normalizeClaim(claims.get("role"));
            String roles = normalizeClaim(claims.get("roles"));

            if (email.isBlank() || userId.isBlank() || role.isBlank()) {
                return onError(exchange, "Token is missing required claims", HttpStatus.UNAUTHORIZED);
            }

            boolean requiresOrganization = !"admin".equalsIgnoreCase(role);
            if (requiresOrganization && organizationId.isBlank()) {
                return onError(exchange, "Token is missing required claims", HttpStatus.UNAUTHORIZED);
            }

            String normalizedRoles = roles.isBlank()
                    ? "ROLE_" + role.toUpperCase(Locale.ROOT)
                    : roles;

            ServerHttpRequest modifiedRequest = request.mutate()
                    .headers(headers -> {
                        FORWARDED_IDENTITY_HEADERS.forEach(headers::remove);
                        headers.add("X-Auth-Validated", "true");
                        headers.add("X-User-Id", userId);
                        headers.add("X-User-Email", email);
                        headers.add("X-User-Name", email);
                        if (!organizationId.isBlank()) {
                            headers.add("X-User-Organization-Id", organizationId);
                        }
                        headers.add("X-User-Role", role);
                        headers.add("X-User-Roles", normalizedRoles);
                    })
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            log.debug("JWT validation failed for path {}", path, e);
            return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"error\": \"" + message + "\"}";
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(publicPath -> matchesPath(path, publicPath));
    }

    private boolean matchesPath(String path, String publicPath) {
        return path.equals(publicPath) || path.startsWith(publicPath + "/");
    }

    private String normalizeClaim(Object claim) {
        return claim == null ? "" : claim.toString().trim();
    }
}
