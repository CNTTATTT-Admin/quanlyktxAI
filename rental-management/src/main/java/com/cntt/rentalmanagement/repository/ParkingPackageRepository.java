package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.ParkingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ParkingPackageRepository extends JpaRepository<ParkingPackage, Long> {
    
    @Modifying
    @Transactional
    void deleteByRentalerId(Long rentalerId);
}