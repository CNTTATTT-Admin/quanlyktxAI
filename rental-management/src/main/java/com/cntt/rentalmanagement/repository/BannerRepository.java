package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveOrderByOrderIndexAsc(Boolean isActive);
    long countByIsActive(Boolean isActive);
}
