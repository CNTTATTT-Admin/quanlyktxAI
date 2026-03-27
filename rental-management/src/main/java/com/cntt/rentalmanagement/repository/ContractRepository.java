package com.cntt.rentalmanagement.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.Contract;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.time.LocalDateTime;

public interface ContractRepository extends JpaRepository<Contract, Long>, ContractRepositoryCustom {
    @Query(value = "SELECT sum(c.numOfPeople) from Contract c ")
    long sumNumOfPeople();

    boolean existsByStudent(User student);

    List<Contract> findByStudentId(Long studentId);

    boolean existsByStudentAndDeadlineContractAfter(User student, LocalDateTime time);

    List<Contract> findByRoomAndDeadlineContractAfter(Room room, LocalDateTime time);

    @Modifying
    @Transactional
    @Query("DELETE FROM Contract c WHERE c.student.id = :userId")
    void deleteByStudentId(@Param("userId") Long userId);
}
