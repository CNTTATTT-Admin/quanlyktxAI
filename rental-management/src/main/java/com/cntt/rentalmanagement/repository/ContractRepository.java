package com.cntt.rentalmanagement.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long>, ContractRepositoryCustom {
    @Query(value = "SELECT sum(c.numOfPeople) from Contract c ")
    long sumNumOfPeople();

    boolean existsByStudent(User student);

    List<Contract> findByStudentId(Long studentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Contract c WHERE c.student.id = :userId")
    void deleteByStudentId(@Param("userId") Long userId);
}
