package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.enums.ParkingCardStatus;
import com.cntt.rentalmanagement.domain.models.ParkingCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

public interface ParkingCardRepository extends JpaRepository<ParkingCard, Long> {

    Page<ParkingCard> findByUserId(Long userId, Pageable pageable);

    @Query(value = "SELECT c.* FROM parking_cards c INNER JOIN parking_packages p ON c.package_id = p.id WHERE p.rentaler_id = :rentalerId", nativeQuery = true)
    List<ParkingCard> findAllByPackageRentalerId(Long rentalerId);

    @Query("SELECT p FROM ParkingCard p WHERE p.user.id = :userId AND " +
       "(:keyword IS NULL OR :keyword = '' OR " +
       "p.licensePlate LIKE %:keyword% OR " +
       "p.parkingPackage.name LIKE %:keyword%)")
    Page<ParkingCard> findByUserIdAndKeyword(@Param("userId") Long userId, 
                                         @Param("keyword") String keyword, 
                                         Pageable pageable);

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

    boolean existsByLicensePlateAndStatusIn(String licensePlate, List<ParkingCardStatus> statuses);

    List<ParkingCard> findByStatusAndExpiryDateBefore(ParkingCardStatus status, LocalDateTime time);
}