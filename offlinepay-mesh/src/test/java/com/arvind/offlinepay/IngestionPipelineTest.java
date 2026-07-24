package com.arvind.offlinepay;

import com.arvind.offlinepay.domain.AccountRepository;
import com.arvind.offlinepay.domain.MeshPacket;
import com.arvind.offlinepay.domain.PaymentInstruction;
import com.arvind.offlinepay.engine.DeduplicationService;
import com.arvind.offlinepay.engine.IngestionPipeline;
import com.arvind.offlinepay.engine.PacketFactory;
import com.arvind.offlinepay.security.EncryptionService;
import com.arvind.offlinepay.security.KeyManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests the critical security and concurrency properties of the payment pipeline.
 *
 * The headline test: 3 bridge nodes deliver the same packet simultaneously.
 * The pipeline must settle exactly one, drop the other two as duplicates,
 * and debit the sender's account exactly once.
 *
 * @author Arvind Dwivedi
 */
@SpringBootTest
class IngestionPipelineTest {

    @Autowired private PacketFactory packetFactory;
    @Autowired private IngestionPipeline pipeline;
    @Autowired private DeduplicationService dedup;
    @Autowired private AccountRepository accounts;
    @Autowired private EncryptionService encryption;
    @Autowired private KeyManager keyManager;

    @BeforeEach
    void resetDedup() {
        dedup.clearAll();
    }

    /**
     * The killer test: three bridges deliver the same packet at the same instant.
     * Verifies that ConcurrentHashMap.putIfAbsent gives exactly one winner.
     */
    @Test
    void samePacketDeliveredByThreeBridgesSettlesExactlyOnce() throws Exception {
        BigDecimal aliceBefore = accounts.findById("alice@arvind").orElseThrow().getBalance();
        BigDecimal bobBefore = accounts.findById("bob@arvind").orElseThrow().getBalance();

        MeshPacket packet = packetFactory.buildPacket(
                "alice@arvind", "bob@arvind", new BigDecimal("100.00"), "1234", 5);

        ExecutorService pool = Executors.newFixedThreadPool(3);
        CountDownLatch gate = new CountDownLatch(1);
        AtomicInteger settled = new AtomicInteger();
        AtomicInteger duplicates = new AtomicInteger();

        Future<?>[] futures = new Future[3];
        for (int i = 0; i < 3; i++) {
            final String bridgeId = "bridge-node-" + i;
            futures[i] = pool.submit(() -> {
                try {
                    gate.await(); // all threads start simultaneously
                    IngestionPipeline.PipelineResult r = pipeline.process(packet, bridgeId, 3);
                    if ("SETTLED".equals(r.outcome())) settled.incrementAndGet();
                    else if ("DUPLICATE_DROPPED".equals(r.outcome())) duplicates.incrementAndGet();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });
        }

        gate.countDown(); // release all 3 threads at once
        for (Future<?> f : futures) f.get(5, TimeUnit.SECONDS);
        pool.shutdown();

        assertEquals(1, settled.get(), "exactly one bridge should settle the payment");
        assertEquals(2, duplicates.get(), "the other two should be dropped as duplicates");

        // Verify balance moved exactly once
        BigDecimal aliceAfter = accounts.findById("alice@arvind").orElseThrow().getBalance();
        BigDecimal bobAfter = accounts.findById("bob@arvind").orElseThrow().getBalance();
        assertEquals(aliceBefore.subtract(new BigDecimal("100.00")), aliceAfter);
        assertEquals(bobBefore.add(new BigDecimal("100.00")), bobAfter);
    }

    /**
     * Flipping a byte in the ciphertext should cause decryption to fail
     * (AES-GCM tag verification), resulting in INVALID outcome.
     */
    @Test
    void tamperedCiphertextIsRejected() throws Exception {
        MeshPacket packet = packetFactory.buildPacket(
                "alice@arvind", "bob@arvind", new BigDecimal("50.00"), "1234", 5);

        // Tamper with the middle of the ciphertext
        char[] chars = packet.getCiphertext().toCharArray();
        chars[chars.length / 2] = chars[chars.length / 2] == 'A' ? 'B' : 'A';
        packet.setCiphertext(new String(chars));

        IngestionPipeline.PipelineResult result = pipeline.process(packet, "bridge-x", 1);
        assertEquals("INVALID", result.outcome());
    }

    /**
     * Sanity check: encrypt → decrypt produces identical instruction data.
     */
    @Test
    void encryptDecryptRoundTrip() throws Exception {
        PaymentInstruction original = new PaymentInstruction(
                "alice@arvind", "bob@arvind", new BigDecimal("123.45"),
                "abcdef", "nonce-roundtrip-1", System.currentTimeMillis());

        String ciphertext = encryption.encrypt(original, keyManager.publicKey());
        PaymentInstruction decrypted = encryption.decrypt(ciphertext);

        assertEquals(original.getSenderVpa(), decrypted.getSenderVpa());
        assertEquals(original.getReceiverVpa(), decrypted.getReceiverVpa());
        assertEquals(0, original.getAmount().compareTo(decrypted.getAmount()));
        assertEquals(original.getNonce(), decrypted.getNonce());
    }
}
