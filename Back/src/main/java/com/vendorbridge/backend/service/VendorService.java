package com.vendorbridge.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vendorbridge.backend.entity.Vendor;
import com.vendorbridge.backend.repository.VendorRepository;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    // GET ALL

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    // CREATE

    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    // GET BY ID

    public Vendor getVendorById(String id) {

        return vendorRepository.findById(id)
                .orElse(null);
    }

    // UPDATE

    public Vendor updateVendor(String id, Vendor updatedVendor) {

        Vendor existingVendor = vendorRepository.findById(id)
                .orElse(null);

        if (existingVendor == null) {
            return null;
        }

        existingVendor.setCompanyName(updatedVendor.getCompanyName());
        existingVendor.setGstNumber(updatedVendor.getGstNumber());
        existingVendor.setCategory(updatedVendor.getCategory());
        existingVendor.setContactPerson(updatedVendor.getContactPerson());
        existingVendor.setEmail(updatedVendor.getEmail());
        existingVendor.setPhone(updatedVendor.getPhone());
        existingVendor.setStatus(updatedVendor.getStatus());

        return vendorRepository.save(existingVendor);
    }

    // DELETE

    public String deleteVendor(String id) {

        vendorRepository.deleteById(id);

        return "Vendor deleted successfully";
    }
}