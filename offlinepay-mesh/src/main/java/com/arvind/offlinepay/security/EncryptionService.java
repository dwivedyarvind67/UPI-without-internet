package com.arvind.offlinepay.security;

import com.arvind.offlinepay.domain.PaymentInstruction;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;

/**
 * Implements hybrid encryption — the same pattern used by TLS, PGP, and Signal.
 *
 * Why hybrid? RSA alone can only encrypt ~245 bytes (with a 2048-bit key).
 * Our payment instruction JSON may exceed that. So we:
 *   1. Generate a fresh AES-256 session key per packet
 *   2. Encrypt the payload with AES-GCM (fast + authenticated)
 *   3. Encrypt just the AES key with RSA-OAEP (key exchange)
 *
 * Wire format after base64 encoding:
 *   [256 bytes RSA-encrypted AES key][12 bytes GCM IV][AES ciphertext + 16-byte GCM tag]
 *
 * AES-GCM is authenticated encryption — any single-bit tampering causes
 * decryption to fail with an exception. Safe for untrusted intermediaries.
 *
 * @author Arvind Dwivedi
 */
@Service
public class EncryptionService {

    private static final String RSA_ALGO = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
    private static final String AES_ALGO = "AES/GCM/NoPadding";
    private static final int AES_KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int RSA_BLOCK_SIZE = 256; // 2048-bit RSA output

    private final SecureRandom secureRandom = new SecureRandom();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final KeyManager keyManager;

    public EncryptionService(KeyManager keyManager) {
        this.keyManager = keyManager;
    }

    /**
     * Encrypts a PaymentInstruction using the recipient's public key.
     * Called by the sender device (simulated server-side for this demo).
     */
    public String encrypt(PaymentInstruction instruction, PublicKey recipientKey) throws Exception {
        byte[] plaintext = objectMapper.writeValueAsBytes(instruction);

        // Step 1: Generate a one-time AES-256 session key
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(AES_KEY_SIZE);
        SecretKey sessionKey = keyGen.generateKey();

        // Step 2: AES-GCM encrypt the JSON payload
        byte[] iv = new byte[GCM_IV_LENGTH];
        secureRandom.nextBytes(iv);
        Cipher aesCipher = Cipher.getInstance(AES_ALGO);
        aesCipher.init(Cipher.ENCRYPT_MODE, sessionKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        byte[] encryptedPayload = aesCipher.doFinal(plaintext);

        // Step 3: RSA-OAEP encrypt the session key with recipient's public key
        Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
        OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        rsaCipher.init(Cipher.ENCRYPT_MODE, recipientKey, oaepParams);
        byte[] wrappedKey = rsaCipher.doFinal(sessionKey.getEncoded());

        // Step 4: Pack into wire format [wrappedKey][iv][encryptedPayload]
        ByteBuffer output = ByteBuffer.allocate(wrappedKey.length + iv.length + encryptedPayload.length);
        output.put(wrappedKey);
        output.put(iv);
        output.put(encryptedPayload);

        return Base64.getEncoder().encodeToString(output.array());
    }

    /**
     * Decrypts a base64-encoded ciphertext using the server's private key.
     * Throws if anything has been tampered with — the GCM authentication
     * tag will fail verification.
     */
    public PaymentInstruction decrypt(String base64Ciphertext) throws Exception {
        byte[] raw = Base64.getDecoder().decode(base64Ciphertext);

        if (raw.length < RSA_BLOCK_SIZE + GCM_IV_LENGTH + GCM_TAG_LENGTH / 8) {
            throw new IllegalArgumentException("Ciphertext too short — likely corrupted or truncated");
        }

        // Unpack the three segments
        byte[] wrappedKey = new byte[RSA_BLOCK_SIZE];
        byte[] iv = new byte[GCM_IV_LENGTH];
        byte[] encryptedPayload = new byte[raw.length - RSA_BLOCK_SIZE - GCM_IV_LENGTH];

        ByteBuffer buffer = ByteBuffer.wrap(raw);
        buffer.get(wrappedKey);
        buffer.get(iv);
        buffer.get(encryptedPayload);

        // Step 1: RSA-unwrap the AES session key
        Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
        OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        rsaCipher.init(Cipher.DECRYPT_MODE, keyManager.privateKey(), oaepParams);
        byte[] sessionKeyBytes = rsaCipher.doFinal(wrappedKey);
        SecretKey sessionKey = new SecretKeySpec(sessionKeyBytes, "AES");

        // Step 2: AES-GCM decrypt + authenticate
        Cipher aesCipher = Cipher.getInstance(AES_ALGO);
        aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        byte[] plaintext = aesCipher.doFinal(encryptedPayload);

        return objectMapper.readValue(plaintext, PaymentInstruction.class);
    }
}
