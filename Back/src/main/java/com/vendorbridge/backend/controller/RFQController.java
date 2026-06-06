
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

import com.vendorbridge.backend.entity.RFQ;
import com.vendorbridge.backend.service.RFQService;

@RestController
@RequestMapping("/api/rfqs")
@CrossOrigin(origins = "*")
public class RFQController {

    private final RFQService rfqService;

    public RFQController(RFQService rfqService) {
        this.rfqService = rfqService;
    }

    // GET ALL RFQs

    @GetMapping
    public List<RFQ> getAllRFQs() {

        return rfqService.getAllRFQs();
    }

    // CREATE RFQ

    @PostMapping
    public RFQ createRFQ(
            @RequestBody RFQ rfq
    ) {

        return rfqService.createRFQ(rfq);
    }

    // GET SINGLE RFQ

    @GetMapping("/{id}")
    public RFQ getRFQById(
            @PathVariable String id
    ) {

        return rfqService.getRFQById(id);
    }

    // UPDATE RFQ

    @PutMapping("/{id}")
    public RFQ updateRFQ(
            @PathVariable String id,
            @RequestBody RFQ rfq
    ) {

        return rfqService.updateRFQ(id, rfq);
    }

    // DELETE RFQ

    @DeleteMapping("/{id}")
    public String deleteRFQ(
            @PathVariable String id
    ) {

        return rfqService.deleteRFQ(id);
    }
}

