package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;


public interface MaintenanceRepository extends JpaRepository<Maintenance, Long>, MaintenanceRepositoryCustom {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM maintenance WHERE room_id = :roomId", nativeQuery = true)
    void deleteByRoomId(Long roomId);
}
