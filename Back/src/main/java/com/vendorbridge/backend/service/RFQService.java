
package com.vendorbridge.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vendorbridge.backend.entity.RFQ;
import com.vendorbridge.backend.repository.RFQRepository;

@Service
public class RFQService {

    private final RFQRepository rfqRepository;

    public RFQService(RFQRepository rfqRepository) {
        this.rfqRepository = rfqRepository;
    }

    // GET ALL

    public List<RFQ> getAllRFQs() {
        return rfqRepository.findAll();
    }

    // CREATE

    public RFQ createRFQ(RFQ rfq) {
        return rfqRepository.save(rfq);
    }

    // GET BY ID

    public RFQ getRFQById(String id) {

        return rfqRepository.findById(id)
                .orElse(null);
    }

    // UPDATE

    public RFQ updateRFQ(String id, RFQ updatedRFQ) {

        RFQ existingRFQ = rfqRepository.findById(id)
                .orElse(null);

        if (existingRFQ == null) {
            return null;
        }

        existingRFQ.setProduct(updatedRFQ.getProduct());
        existingRFQ.setQuantity(updatedRFQ.getQuantity());
        existingRFQ.setUnit(updatedRFQ.getUnit());
        existingRFQ.setDescription(updatedRFQ.getDescription());
        existingRFQ.setDeadline(updatedRFQ.getDeadline());
        existingRFQ.setStatus(updatedRFQ.getStatus());

        return rfqRepository.save(existingRFQ);
    }

    // DELETE

    public String deleteRFQ(String id) {

        rfqRepository.deleteById(id);

        return "RFQ deleted successfully";
    }
}

