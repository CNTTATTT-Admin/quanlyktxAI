package com.cntt.rentalmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.cntt.rentalmanagement.domain.models.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comment WHERE room_id = :roomId", nativeQuery = true)
    void deleteByRoomId(Long roomId);
}
