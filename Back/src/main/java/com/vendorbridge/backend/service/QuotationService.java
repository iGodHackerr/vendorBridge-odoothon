
package com.vendorbridge.backend.service;

import com.vendorbridge.backend.entity.Quotation;
import com.vendorbridge.backend.repository.QuotationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;

    public QuotationService(QuotationRepository quotationRepository) {
        this.quotationRepository = quotationRepository;
    }

    // GET ALL

    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    // GET BY RFQ ID

    public List<Quotation> getQuotationsByRFQ(String rfqId) {
        return quotationRepository.findByRfqId(rfqId);
    }

    // CREATE

    public Quotation createQuotation(Quotation quotation) {
        return quotationRepository.save(quotation);
    }

    // GET SINGLE

    public Quotation getQuotationById(String id) {

        return quotationRepository.findById(id)
                .orElse(null);
    }

    // UPDATE

    public Quotation updateQuotation(
            String id,
            Quotation updatedQuotation
    ) {

        Quotation existingQuotation =
                quotationRepository.findById(id)
                        .orElse(null);

        if (existingQuotation == null) {
            return null;
        }

        existingQuotation.setVendorName(
                updatedQuotation.getVendorName()
        );

        existingQuotation.setUnitPrice(
                updatedQuotation.getUnitPrice()
        );

        existingQuotation.setTotalPrice(
                updatedQuotation.getTotalPrice()
        );

        existingQuotation.setDeliveryDays(
                updatedQuotation.getDeliveryDays()
        );

        existingQuotation.setRemarks(
                updatedQuotation.getRemarks()
        );

        existingQuotation.setStatus(
                updatedQuotation.getStatus()
        );

        return quotationRepository.save(existingQuotation);
    }

    // DELETE

    public String deleteQuotation(String id) {

        quotationRepository.deleteById(id);

        return "Quotation deleted successfully";
    }
}

