package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.enums.ParkingPackageStatus;
import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ParkingPackageRepository extends JpaRepository<ParkingPackage, Long> {

    List<ParkingPackage> findByRentalerIdAndStatus(Long rentalerId, ParkingPackageStatus status);
    
    @Modifying
    @Transactional
    void deleteByRentalerId(Long rentalerId);
    
}