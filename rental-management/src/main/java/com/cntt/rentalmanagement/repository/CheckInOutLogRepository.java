package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.CheckInOutLog;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckInOutLogRepository extends JpaRepository<CheckInOutLog, Long> {
    Page<CheckInOutLog> findByUser(User user, Pageable pageable);
}
