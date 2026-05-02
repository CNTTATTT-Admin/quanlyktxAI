package com.cntt.rentalmanagement.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.cntt.rentalmanagement.domain.models.LeaveRequest;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findByUser(User user, Pageable pageable);
    Page<LeaveRequest> findByStatus(Enum status, Pageable pageable);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.allocatedRoom.user.id = :rentalerId")
    Page<LeaveRequest> findRequestsByRentaler(@Param("rentalerId") Long rentalerId, Pageable pageable);
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
