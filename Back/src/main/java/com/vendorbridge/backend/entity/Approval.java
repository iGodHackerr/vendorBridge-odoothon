
package com.vendorbridge.backend.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "approvals")
public class Approval {

    @Id
    private String id;

    @Column(name = "rfq_id")
    private String rfqId;

    @Column(name = "quotation_id")
    private String quotationId;

    @Column(name = "vendor_id")
    private String vendorId;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    private String status;

    private String remarks;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_by_id")
    private String approvedById;

    @Column(name = "decision_at")
    private LocalDateTime decisionAt;

    @PrePersist
    public void generateData() {

        this.id = UUID.randomUUID().toString();

        this.requestedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = "Pending";
        }
    }

    public Approval() {
    }

    // GETTERS & SETTERS

    public String getId() {
        return id;
    }

    public String getRfqId() {
        return rfqId;
    }

    public void setRfqId(String rfqId) {
        this.rfqId = rfqId;
    }

    public String getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(String quotationId) {
        this.quotationId = quotationId;
    }

    public String getVendorId() {
        return vendorId;
    }

    public void setVendorId(String vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getApprovedById() {
        return approvedById;
    }

    public void setApprovedById(String approvedById) {
        this.approvedById = approvedById;
    }

    public LocalDateTime getDecisionAt() {
        return decisionAt;
    }

    public void setDecisionAt(LocalDateTime decisionAt) {
        this.decisionAt = decisionAt;
    }
}

