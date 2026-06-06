
package com.vendorbridge.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vendorbridge.backend.entity.Approval;

public interface ApprovalRepository extends JpaRepository<Approval, String> {

}

