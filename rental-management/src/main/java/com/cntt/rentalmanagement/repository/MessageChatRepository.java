package com.cntt.rentalmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cntt.rentalmanagement.domain.models.Category;
import com.cntt.rentalmanagement.domain.models.MessageChat;

@Repository
public interface MessageChatRepository extends JpaRepository<MessageChat, Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM message_chat WHERE message_id IN (SELECT id FROM message WHERE user1 = :userId OR user2 = :userId)", nativeQuery = true)
    void deleteMessageChatByUserId(@Param("userId") Long userId);
}
