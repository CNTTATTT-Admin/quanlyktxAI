package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.LeaveRequest;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findByUser(User user, Pageable pageable);
    Page<LeaveRequest> findByStatus(Enum status, Pageable pageable);
}
