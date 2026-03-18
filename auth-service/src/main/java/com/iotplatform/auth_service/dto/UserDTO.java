// src/main/java/com/iotplatform/auth_service/dto/UserDTO.java
package com.iotplatform.auth_service.dto;

public class UserDTO {
    private String name;
    private String password;

    // Getters & Setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
