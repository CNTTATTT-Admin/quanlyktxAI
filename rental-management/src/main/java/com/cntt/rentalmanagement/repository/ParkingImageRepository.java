package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.ParkingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface ParkingImageRepository extends JpaRepository<ParkingImage, Long> {
    List<ParkingImage> findByParkingCardId(Long parkingCardId);

@Modifying
@Transactional
@Query("DELETE FROM ParkingImage p WHERE p.parkingCard.id = :cardId")
void deleteAllByParkingCardId(Long cardId);
}