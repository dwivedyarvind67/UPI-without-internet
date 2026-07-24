package com.arvind.offlinepay.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access layer for Account entities.
 * Spring Data auto-generates the implementation at runtime.
 *
 * @author Arvind Dwivedi
 */
public interface AccountRepository extends JpaRepository<Account, String> {
}
