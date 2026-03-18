package com.iotplatform.auth_service.payload.request;

public class SignupRequest {
    private String name;
    private String password;

    public SignupRequest() {
    }

    public SignupRequest(String name, String password) {
        this.name = name;
        this.password = password;
    }

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