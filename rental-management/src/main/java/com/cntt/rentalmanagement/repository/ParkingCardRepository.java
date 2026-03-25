package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.ParkingCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ParkingCardRepository extends JpaRepository<ParkingCard, Long> {

    Page<ParkingCard> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT p FROM ParkingCard p WHERE p.parkingPackage.rentaler.id = :rentalerId " +
           "AND (:keyword IS NULL OR :keyword = '' " +
           "OR p.licensePlate LIKE %:keyword% " +
           "OR p.user.name LIKE %:keyword%)")
    Page<ParkingCard> findByRentalerIdAndKeyword(
            @Param("rentalerId") Long rentalerId, 
            @Param("keyword") String keyword, 
            Pageable pageable);
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    boolean existsByLicensePlate(String licensePlate);
}