package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContractRepository extends JpaRepository<Contract, Long>, ContractRepositoryCustom {
    @Query(value = "SELECT sum(c.numOfPeople) from Contract c ")
    long sumNumOfPeople();

    boolean existsByStudent(User student);
}
