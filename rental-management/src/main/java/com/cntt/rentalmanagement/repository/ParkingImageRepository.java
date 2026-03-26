package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.ParkingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingImageRepository extends JpaRepository<ParkingImage, Long> {
    List<ParkingImage> findByParkingCardId(Long parkingCardId);
}