
package com.vendorbridge.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vendorbridge.backend.entity.Approval;
import com.vendorbridge.backend.service.ApprovalService;

@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(
            ApprovalService approvalService
    ) {
        this.approvalService = approvalService;
    }

    // GET ALL

    @GetMapping
    public List<Approval> getAllApprovals() {

        return approvalService.getAllApprovals();
    }

    // CREATE

    @PostMapping
    public Approval createApproval(
            @RequestBody Approval approval
    ) {

        return approvalService.createApproval(approval);
    }

    // APPROVE

    @PutMapping("/{id}/approve")
    public Approval approveApproval(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {

        return approvalService.approveApproval(
                id,
                body.get("approvedBy"),
                body.get("approvedById")
        );
    }

    // REJECT

    @PutMapping("/{id}/reject")
    public Approval rejectApproval(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {

        return approvalService.rejectApproval(
                id,
                body.get("approvedBy"),
                body.get("approvedById")
        );
    }
}

