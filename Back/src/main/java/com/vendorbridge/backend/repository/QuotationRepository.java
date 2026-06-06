
package com.vendorbridge.backend.repository;

import com.vendorbridge.backend.entity.Quotation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation, String> {

    List<Quotation> findByRfqId(String rfqId);
}

