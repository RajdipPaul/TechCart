package com.TechCart.conversation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUserUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<Conversation> findByConverIdAndUserUserId(Long converId, Long userId);
}