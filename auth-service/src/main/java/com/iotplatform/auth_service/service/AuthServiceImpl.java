package com.iotplatform.auth_service.service;

import com.iotplatform.auth_service.model.User;
import com.iotplatform.auth_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean authenticate(String name, String password) {
        User user = userRepository.findByName(name).orElse(null);

        if (user == null) {
            return false;
        }

        return passwordEncoder.matches(password, user.getPassword());
    }

    @Override
    public boolean userExists(String name) {
        return userRepository.findByName(name).isPresent();
    }

    @Override
    public void registerUser(String name, String password) {
        User user = new User();
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}