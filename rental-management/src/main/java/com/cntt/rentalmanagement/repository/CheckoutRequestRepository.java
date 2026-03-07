package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.CheckoutRequest;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckoutRequestRepository extends JpaRepository<CheckoutRequest, Long> {
    
    @Query("SELECT c FROM CheckoutRequest c WHERE c.room.user.id = ?1 ORDER BY c.id DESC")
    Page<CheckoutRequest> findByRentaler(Long rentalerId, Pageable pageable);
    
    @Query("SELECT c FROM CheckoutRequest c WHERE c.user.id = ?1 ORDER BY c.id DESC")
    Page<CheckoutRequest> findByUser(Long userId, Pageable pageable);

    @Query("SELECT c FROM CheckoutRequest c WHERE c.user.id = ?1 AND c.room.id = ?2 AND c.status = 'PENDING'")
    Optional<CheckoutRequest> findPendingByUserAndRoom(Long userId, Long roomId);
}
