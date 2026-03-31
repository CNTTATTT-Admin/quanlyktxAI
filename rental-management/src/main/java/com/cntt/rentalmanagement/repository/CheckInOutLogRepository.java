package com.cntt.rentalmanagement.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.cntt.rentalmanagement.domain.models.CheckInOutLog;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckInOutLogRepository extends JpaRepository<CheckInOutLog, Long> {
    Page<CheckInOutLog> findByUser(User user, Pageable pageable);

    @Query("SELECT log FROM CheckInOutLog log " +
           "WHERE log.user.allocatedRoom.user.id = :rentalerId " +
           "AND (:roomId IS NULL OR log.user.allocatedRoom.id = :roomId)")
    Page<CheckInOutLog> findByRentalerIdAndRoomId(@Param("rentalerId") Long rentalerId, 
                                                @Param("roomId") Long roomId, 
                                                Pageable pageable);

    List<CheckInOutLog> findByUserAndCheckTimeBetween(User user, java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
