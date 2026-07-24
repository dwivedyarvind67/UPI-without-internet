package com.arvind.offlinepay.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

/**
 * Manages the server's RSA-2048 keypair used for hybrid encryption.
 *
 * In production, the private key would live in an HSM (Hardware Security Module)
 * or a managed KMS like AWS KMS / HashiCorp Vault — never in the source code.
 * For this demo, a fresh keypair is generated on each startup.
 *
 * The public key is exposed via /api/server-key so sender devices can
 * encrypt payment payloads destined for this server.
 *
 * @author Arvind Dwivedi
 */
@Component
public class KeyManager {

    private static final Logger log = LoggerFactory.getLogger(KeyManager.class);

    private KeyPair keyPair;

    @PostConstruct
    public void generateKeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        this.keyPair = generator.generateKeyPair();
        log.info("RSA-2048 keypair initialized. Public key fingerprint: {}...",
                publicKeyBase64().substring(0, 32));
    }

    public PublicKey publicKey() {
        return keyPair.getPublic();
    }

    public PrivateKey privateKey() {
        return keyPair.getPrivate();
    }

    public String publicKeyBase64() {
        return Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }
}
