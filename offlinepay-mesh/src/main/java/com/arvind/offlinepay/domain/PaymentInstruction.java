package com.arvind.offlinepay.domain;

import java.math.BigDecimal;

/**
 * The actual payment details hidden inside MeshPacket.ciphertext.
 * After the server decrypts the ciphertext, it extracts this object.
 *
 * Security-critical fields:
 *   - nonce:    UUID unique per payment intent. Even if Alice sends Bob ₹100
 *              twice, different nonces produce different ciphertexts and thus
 *              different idempotency hashes — both will settle correctly.
 *   - signedAt: epoch millis recording when the sender created this instruction.
 *              Enables freshness validation (stale packet = potential replay attack).
 *   - pinHash:  SHA-256 of the user's UPI PIN. In production, verified against
 *              the bank's stored hash. Here we just record it for realism.
 *
 * @author Arvind Dwivedi
 */
public class PaymentInstruction {

    private String senderVpa;
    private String receiverVpa;
    private BigDecimal amount;
    private String pinHash;
    private String nonce;
    private Long signedAt;

    public PaymentInstruction() {}

    public PaymentInstruction(String senderVpa, String receiverVpa, BigDecimal amount,
                              String pinHash, String nonce, Long signedAt) {
        this.senderVpa = senderVpa;
        this.receiverVpa = receiverVpa;
        this.amount = amount;
        this.pinHash = pinHash;
        this.nonce = nonce;
        this.signedAt = signedAt;
    }

    public String getSenderVpa() { return senderVpa; }
    public void setSenderVpa(String senderVpa) { this.senderVpa = senderVpa; }

    public String getReceiverVpa() { return receiverVpa; }
    public void setReceiverVpa(String receiverVpa) { this.receiverVpa = receiverVpa; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPinHash() { return pinHash; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }

    public String getNonce() { return nonce; }
    public void setNonce(String nonce) { this.nonce = nonce; }

    public Long getSignedAt() { return signedAt; }
    public void setSignedAt(Long signedAt) { this.signedAt = signedAt; }
}
