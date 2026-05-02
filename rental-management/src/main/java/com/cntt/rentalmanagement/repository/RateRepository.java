package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

@Repository
public interface RateRepository extends JpaRepository<Rate, Long> {
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM rate WHERE room_id = :roomId", nativeQuery = true)
    void deleteByRoomId(Long roomId);
}