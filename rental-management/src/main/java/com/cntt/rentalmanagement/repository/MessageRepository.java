package com.cntt.rentalmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cntt.rentalmanagement.domain.models.Message;
import com.cntt.rentalmanagement.domain.models.User;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>{

    Message findBySenderAndReceiver(User sender, User receiver);

    List<Message> findBySender(User sender);

    List<Message> findByReceiver(User receiver);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM message WHERE user1 = :userId OR user2 = :userId", nativeQuery = true)
    void deleteMessageByUserId(@Param("userId") Long userId);

}
