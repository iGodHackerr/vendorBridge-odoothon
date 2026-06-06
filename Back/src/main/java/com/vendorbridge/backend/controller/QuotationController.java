
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

import com.vendorbridge.backend.entity.Quotation;
import com.vendorbridge.backend.service.QuotationService;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin(origins = "*")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(
            QuotationService quotationService
    ) {
        this.quotationService = quotationService;
    }

    // GET ALL QUOTATIONS

    @GetMapping
    public List<Quotation> getAllQuotations() {

        return quotationService.getAllQuotations();
    }

    // GET QUOTATIONS BY RFQ

    @GetMapping("/rfq/{rfqId}")
    public List<Quotation> getQuotationsByRFQ(
            @PathVariable String rfqId
    ) {

        return quotationService.getQuotationsByRFQ(rfqId);
    }

    // CREATE QUOTATION

    @PostMapping
    public Quotation createQuotation(
            @RequestBody Quotation quotation
    ) {

        return quotationService.createQuotation(quotation);
    }

    // GET SINGLE QUOTATION

    @GetMapping("/{id}")
    public Quotation getQuotationById(
            @PathVariable String id
    ) {

        return quotationService.getQuotationById(id);
    }

    // UPDATE QUOTATION

    @PutMapping("/{id}")
    public Quotation updateQuotation(
            @PathVariable String id,
            @RequestBody Quotation quotation
    ) {

        return quotationService.updateQuotation(id, quotation);
    }

    // DELETE QUOTATION

    @DeleteMapping("/{id}")
    public String deleteQuotation(
            @PathVariable String id
    ) {

        return quotationService.deleteQuotation(id);
    }
}

