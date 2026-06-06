
package com.vendorbridge.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.vendorbridge.backend.entity.Approval;
import com.vendorbridge.backend.repository.ApprovalRepository;

@Service
public class ApprovalService {

    private final ApprovalRepository approvalRepository;

    public ApprovalService(
            ApprovalRepository approvalRepository
    ) {
        this.approvalRepository = approvalRepository;
    }

    // GET ALL

    public List<Approval> getAllApprovals() {
        return approvalRepository.findAll();
    }

    // CREATE

    public Approval createApproval(
            Approval approval
    ) {

        return approvalRepository.save(approval);
    }

    // APPROVE

    public Approval approveApproval(
            String id,
            String approvedBy,
            String approvedById
    ) {

        Approval approval =
                approvalRepository.findById(id)
                        .orElse(null);

        if (approval == null) {
            return null;
        }

        approval.setStatus("Approved");
        approval.setApprovedBy(approvedBy);
        approval.setApprovedById(approvedById);
        approval.setDecisionAt(LocalDateTime.now());

        return approvalRepository.save(approval);
    }

    // REJECT

    public Approval rejectApproval(
            String id,
            String approvedBy,
            String approvedById
    ) {

        Approval approval =
                approvalRepository.findById(id)
                        .orElse(null);

        if (approval == null) {
            return null;
        }

        approval.setStatus("Rejected");
        approval.setApprovedBy(approvedBy);
        approval.setApprovedById(approvedById);
        approval.setDecisionAt(LocalDateTime.now());

        return approvalRepository.save(approval);
    }
}

