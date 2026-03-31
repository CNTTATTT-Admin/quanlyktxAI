package com.cntt.rentalmanagement.repository;

import com.cntt.rentalmanagement.domain.models.BlogStore;
import com.cntt.rentalmanagement.domain.models.Room;
import com.cntt.rentalmanagement.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


public interface BlogStoreRepository extends JpaRepository<BlogStore, Long>,BlogStoreRepositoryCustom {
    Optional<BlogStore> findByRoomAndUser(Room room, User user);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM blog_store WHERE room_id = :roomId", nativeQuery = true)
    void deleteByRoomId(Long roomId);
}
