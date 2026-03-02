package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, Long> {
    Optional<Configuration> findByConfigKey(String configKey);
}
