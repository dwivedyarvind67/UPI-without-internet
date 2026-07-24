package com.arvind.offlinepay.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access layer for Transaction entities.
 *
 * @author Arvind Dwivedi
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findTop20ByOrderByIdDesc();
    boolean existsByPacketHash(String packetHash);
}
