package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}