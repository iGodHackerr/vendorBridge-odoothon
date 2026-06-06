package com.vendorbridge.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vendorbridge.backend.entity.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, String> {

}