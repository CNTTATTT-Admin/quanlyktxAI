package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    Invoice findFirstByParkingCardIdOrderByIdDesc(Long parkingCardId);

    @Query("SELECT i FROM Invoice i WHERE i.parkingCard.parkingPackage.rentaler.id = :rentalerId " +
           "AND (:keyword IS NULL OR :keyword = '' " +
           "OR i.user.name LIKE %:keyword% " +
           "OR i.parkingCard.licensePlate LIKE %:keyword%)")
    Page<Invoice> findByRentalerIdAndKeyword(
            @Param("rentalerId") Long rentalerId, 
            @Param("keyword") String keyword, 
            Pageable pageable);
}