package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.Request;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface RequestRepository extends JpaRepository<Request, Long>, RequestCustomRepository {
    Optional<Request> findByRoomAndUserAndIsAnswer(Room room, User user, Boolean isAnswer);
}
