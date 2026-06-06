package com.vendorbridge.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/login")
    public String home() {
        return "VendorBridge Backend Running Successfully";
    }
    //public static void main(String[] args) {
      //  SpringApplication.run(BackendApplication.class, args);
    //}
}