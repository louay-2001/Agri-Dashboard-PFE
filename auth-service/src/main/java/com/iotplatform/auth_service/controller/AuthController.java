package com.iotplatform.auth_service.controller;

import com.iotplatform.auth_service.payload.request.LoginRequest;
import com.iotplatform.auth_service.payload.request.SignupRequest;
import com.iotplatform.auth_service.payload.response.JwtResponse;
import com.iotplatform.auth_service.payload.response.MessageResponse;
import com.iotplatform.auth_service.security.JwtUtils;
import com.iotplatform.auth_service.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    public AuthController(AuthService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        boolean authenticated = authService.authenticate(request.getName(), request.getPassword());

        if (!authenticated) {
            return ResponseEntity.status(401).body(new MessageResponse("Authentication failed"));
        }

        String token = jwtUtils.generateToken(request.getName());

        return ResponseEntity.ok(new JwtResponse(token, "Bearer", request.getName()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            if (authService.userExists(request.getName())) {
                return ResponseEntity.badRequest().body(new MessageResponse("User already exists"));
            }

            authService.registerUser(request.getName(), request.getPassword());

            return ResponseEntity.ok(new MessageResponse("User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}