package com.vendorbridge.backend.dto;

import com.vendorbridge.backend.entity.Role;

public class AuthResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(
            String id,
            String name,
            String email,
            Role role,
            String message
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}