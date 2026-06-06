package com.vendorbridge.backend.service;

import org.springframework.stereotype.Service;

import com.vendorbridge.backend.dto.AuthResponse;
import com.vendorbridge.backend.dto.LoginRequest;
import com.vendorbridge.backend.dto.RegisterRequest;
import com.vendorbridge.backend.entity.User;
import com.vendorbridge.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            return new AuthResponse(
                    null,
                    null,
                    null,
                    null,
                    "Email already exists"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Registration successful"
        );
    }

    // LOGIN

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {

            return new AuthResponse(
                    null,
                    null,
                    null,
                    null,
                    "User not found"
            );
        }

        if (!user.getPassword().equals(request.getPassword())) {

            return new AuthResponse(
                    null,
                    null,
                    null,
                    null,
                    "Invalid password"
            );
        }

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                "Login successful"
        );
    }
}