package com.arvind.offlinepay.security;

import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * SHA-256 hashing utilities for the payment system.
 *
 * Used for two purposes:
 *   1. Generating idempotency keys from ciphertext — the hash uniquely
 *      identifies a payment even if outer packet fields are tampered with
 *   2. Hashing UPI PINs before embedding them in payment instructions
 *
 * @author Arvind Dwivedi
 */
@Service
public class HashingService {

    /**
     * Computes SHA-256 of the input string and returns it as lowercase hex.
     */
    public String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed by the Java spec — this should never happen
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
