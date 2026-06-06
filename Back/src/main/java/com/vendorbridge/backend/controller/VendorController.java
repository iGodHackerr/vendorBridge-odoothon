package com.vendorbridge.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vendorbridge.backend.entity.Vendor;
import com.vendorbridge.backend.service.VendorService;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    // GET ALL VENDORS

    @GetMapping
    public List<Vendor> getAllVendors() {

        return vendorService.getAllVendors();
    }

    // CREATE VENDOR

    @PostMapping
    public Vendor createVendor(
            @RequestBody Vendor vendor
    ) {

        return vendorService.createVendor(vendor);
    }

    // GET SINGLE VENDOR

    @GetMapping("/{id}")
    public Vendor getVendorById(
            @PathVariable String id
    ) {

        return vendorService.getVendorById(id);
    }

    // UPDATE VENDOR

    @PutMapping("/{id}")
    public Vendor updateVendor(
            @PathVariable String id,
            @RequestBody Vendor vendor
    ) {

        return vendorService.updateVendor(id, vendor);
    }

    // DELETE VENDOR

    @DeleteMapping("/{id}")
    public String deleteVendor(
            @PathVariable String id
    ) {

        return vendorService.deleteVendor(id);
    }
}