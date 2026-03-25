package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.ParkingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkingImageRepository extends JpaRepository<ParkingImage, Long> {
}