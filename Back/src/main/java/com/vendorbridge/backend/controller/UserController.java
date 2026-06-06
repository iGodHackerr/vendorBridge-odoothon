package com.vendorbridge.backend.controller;

import com.vendorbridge.backend.entity.Role;
import com.vendorbridge.backend.entity.User;
import com.vendorbridge.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE USER
    @PostMapping("/create")
    public User createUser() {

        User user = new User();

        user.setName("Smit Patel");
        user.setEmail("smit@gmail.com");
        user.setPassword("123456");
        user.setRole(Role.admin);

        return userRepository.save(user);
    }

    // GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}