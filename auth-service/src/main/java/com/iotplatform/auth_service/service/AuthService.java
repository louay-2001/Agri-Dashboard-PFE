package com.iotplatform.auth_service.service;

public interface AuthService {
    boolean authenticate(String name, String password);
    boolean userExists(String name);
    void registerUser(String name, String password);
}