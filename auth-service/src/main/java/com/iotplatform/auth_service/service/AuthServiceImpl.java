package com.iotplatform.auth_service.service;

import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.model.UserRole;
import com.iotplatform.auth_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(normalizeEmail(email));

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();
        String storedPassword = user.getPasswordHash();

        if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
            return Optional.of(user);
        }

        // Backward compatibility for legacy rows that were stored as plain text.
        if (storedPassword != null && storedPassword.equals(password)) {
            user.setPasswordHash(passwordEncoder.encode(password));
            userRepository.save(user);
            return Optional.of(user);
        }

        return Optional.empty();
    }

    @Override
    public boolean userExists(String email) {
        return userRepository.existsByEmailIgnoreCase(normalizeEmail(email));
    }

    @Override
    public User registerUser(String email, String password, UUID organizationId, UserRole role) {
        User user = new User();
        user.setEmail(normalizeEmail(email));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setOrganizationId(organizationId);
        user.setRole(role);
        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
