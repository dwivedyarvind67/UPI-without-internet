package com.arvind.offlinepay.engine;

import com.arvind.offlinepay.domain.Account;
import com.arvind.offlinepay.domain.AccountRepository;
import com.arvind.offlinepay.domain.MeshPacket;
import com.arvind.offlinepay.domain.PaymentInstruction;
import com.arvind.offlinepay.security.EncryptionService;
import com.arvind.offlinepay.security.HashingService;
import com.arvind.offlinepay.security.KeyManager;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Simulates a sender's phone creating an encrypted payment packet.
 * Also handles seeding demo accounts on application startup.
 *
 * In a real Android app, similar encryption logic would run locally
 * on the device using the server's cached public key.
 *
 * @author Arvind Dwivedi
 */
@Service
public class PacketFactory {

    private static final Logger log = LoggerFactory.getLogger(PacketFactory.class);

    private final AccountRepository accountRepo;
    private final EncryptionService encryption;
    private final KeyManager keyManager;
    private final HashingService hashing;

    public PacketFactory(AccountRepository accountRepo, EncryptionService encryption,
                         KeyManager keyManager, HashingService hashing) {
        this.accountRepo = accountRepo;
        this.encryption = encryption;
        this.keyManager = keyManager;
        this.hashing = hashing;
    }

    @PostConstruct
    public void seedDemoAccounts() {
        if (accountRepo.count() == 0) {
            accountRepo.save(new Account("alice@arvind", "Alice", new BigDecimal("5000.00")));
            accountRepo.save(new Account("bob@arvind",   "Bob",   new BigDecimal("1000.00")));
            accountRepo.save(new Account("carol@arvind", "Carol", new BigDecimal("2500.00")));
            accountRepo.save(new Account("dave@arvind",  "Dave",  new BigDecimal("500.00")));
            log.info("Initialized 4 demo accounts with starting balances");
        }
    }

    /**
     * Builds an encrypted MeshPacket ready for injection into the mesh.
     */
    public MeshPacket buildPacket(String senderVpa, String receiverVpa,
                                  BigDecimal amount, String pin, int ttl) throws Exception {

        PaymentInstruction instruction = new PaymentInstruction(
                senderVpa, receiverVpa, amount,
                hashing.sha256Hex(pin),
                UUID.randomUUID().toString(),
                Instant.now().toEpochMilli()
        );

        String ciphertext = encryption.encrypt(instruction, keyManager.publicKey());

        MeshPacket packet = new MeshPacket();
        packet.setPacketId(UUID.randomUUID().toString());
        packet.setTtl(ttl);
        packet.setCreatedAt(Instant.now().toEpochMilli());
        packet.setCiphertext(ciphertext);
        return packet;
    }
}
