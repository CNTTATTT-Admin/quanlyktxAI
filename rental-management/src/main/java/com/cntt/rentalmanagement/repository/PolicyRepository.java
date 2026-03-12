package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findFirstByIsActiveTrueOrderByUpdatedAtDesc();
}
