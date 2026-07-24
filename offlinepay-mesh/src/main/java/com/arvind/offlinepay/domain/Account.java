package com.arvind.offlinepay.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Represents a simulated bank account in the offline payment system.
 * Each account is identified by a VPA (Virtual Payment Address) like "alice@arvind".
 *
 * Uses @Version for optimistic locking — if two threads try to update the same
 * account concurrently, the second one gets an OptimisticLockException rather
 * than silently corrupting the balance.
 *
 * @author Arvind Dwivedi
 */
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    private String vpa;

    @Column(nullable = false)
    private String holderName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    @Version
    private Long version;

    public Account() {}

    public Account(String vpa, String holderName, BigDecimal balance) {
        this.vpa = vpa;
        this.holderName = holderName;
        this.balance = balance;
    }

    public String getVpa() { return vpa; }
    public void setVpa(String vpa) { this.vpa = vpa; }

    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
