package com.iotplatform.auth_service.controller;

import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.payload.request.LoginRequest;
import com.iotplatform.auth_service.payload.request.SignupRequest;
import com.iotplatform.auth_service.payload.response.JwtResponse;
import com.iotplatform.auth_service.payload.response.MessageResponse;
import com.iotplatform.auth_service.security.JwtUtils;
import com.iotplatform.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    public AuthController(AuthService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping({"/signin", "/login"})
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> authenticatedUser = authService.authenticate(request.getEmail(), request.getPassword());

        if (authenticatedUser.isEmpty()) {
            return ResponseEntity.status(401).body(new MessageResponse("Authentication failed"));
        }

        User user = authenticatedUser.get();
        String token = jwtUtils.generateToken(user);

        return ResponseEntity.ok(new JwtResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getEmail(),
                user.getOrganizationId(),
                user.getRole().getValue()
        ));
    }

    @PostMapping({"/signup", "/register"})
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            if (authService.userExists(request.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("User already exists for this email"));
            }

            authService.registerUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getOrganizationId(),
                    request.getRole()
            );

            return ResponseEntity.ok(new MessageResponse("User registered successfully"));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new MessageResponse(exception.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
