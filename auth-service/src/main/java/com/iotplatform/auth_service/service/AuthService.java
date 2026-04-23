package com.iotplatform.auth_service.service;

import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.model.UserRole;

import java.util.Optional;
import java.util.UUID;

public interface AuthService {
    Optional<User> authenticate(String email, String password);

    boolean userExists(String email);

    User registerUser(String email, String password, UUID organizationId, UserRole role);
}
