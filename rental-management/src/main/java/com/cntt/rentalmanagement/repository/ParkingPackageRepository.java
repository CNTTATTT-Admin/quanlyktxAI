package com.cntt.rentalmanagement.repository;

import org.springframework.data.domain.Page;
    import org.springframework.data.domain.Pageable;
import com.cntt.rentalmanagement.domain.enums.ParkingPackageStatus;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ParkingPackageRepository extends JpaRepository<ParkingPackage, Long> {

    List<ParkingPackage> findByRentalerIdAndStatus(Long rentalerId, ParkingPackageStatus status);

    @Query("SELECT p FROM ParkingPackage p WHERE p.rentaler.id = :rentalerId " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ParkingPackage> findByRentalerIdAndKeyword(
            @Param("rentalerId") Long rentalerId, 
            @Param("keyword") String keyword, 
            Pageable pageable);
    
    @Modifying
    @Transactional
    void deleteByRentalerId(Long rentalerId);
    
}