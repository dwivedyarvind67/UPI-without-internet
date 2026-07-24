package com.arvind.offlinepay.engine;

import com.arvind.offlinepay.domain.MeshPacket;
import com.arvind.offlinepay.domain.PaymentInstruction;
import com.arvind.offlinepay.domain.Transaction;
import com.arvind.offlinepay.security.EncryptionService;
import com.arvind.offlinepay.security.HashingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * The core server-side processing pipeline for inbound mesh packets.
 *
 * When a bridge node uploads a packet, this pipeline runs:
 *   Stage 1 — Hash ciphertext → idempotency key
 *   Stage 2 — Claim hash via DeduplicationService (atomic)
 *   Stage 3 — Decrypt ciphertext with server's private key
 *   Stage 4 — Validate freshness (replay protection)
 *   Stage 5 — Hand off to SettlementEngine for debit/credit
 *
 * @author Arvind Dwivedi
 */
@Service
public class IngestionPipeline {

    private static final Logger log = LoggerFactory.getLogger(IngestionPipeline.class);

    private final HashingService hashing;
    private final DeduplicationService dedup;
    private final EncryptionService encryption;
    private final SettlementEngine settlement;

    @Value("${offlinepay.packet.max-age-seconds:86400}")
    private long maxAgeSeconds;

    public IngestionPipeline(HashingService hashing, DeduplicationService dedup,
                             EncryptionService encryption, SettlementEngine settlement) {
        this.hashing = hashing;
        this.dedup = dedup;
        this.encryption = encryption;
        this.settlement = settlement;
    }

    public PipelineResult process(MeshPacket packet, String bridgeNodeId, int hopCount) {
        try {
            String packetHash = hashing.sha256Hex(packet.getCiphertext());

            // ── Stage 1: Deduplication ──
            if (!dedup.claim(packetHash)) {
                log.info("DUPLICATE packet {}... from bridge {} — dropped",
                        packetHash.substring(0, 12), bridgeNodeId);
                return PipelineResult.duplicate(packetHash);
            }

            // ── Stage 2: Decryption ──
            PaymentInstruction instruction;
            try {
                instruction = encryption.decrypt(packet.getCiphertext());
            } catch (Exception ex) {
                log.warn("Decryption failed for packet {}...: {}",
                        packetHash.substring(0, 12), ex.getMessage());
                return PipelineResult.invalid(packetHash, "decryption_failed");
            }

            // ── Stage 3: Freshness validation ──
            long ageSeconds = (Instant.now().toEpochMilli() - instruction.getSignedAt()) / 1000;
            if (ageSeconds > maxAgeSeconds) {
                log.warn("Packet {}... is {}s old — rejected as stale",
                        packetHash.substring(0, 12), ageSeconds);
                return PipelineResult.invalid(packetHash, "stale_packet");
            }
            if (ageSeconds < -300) {
                return PipelineResult.invalid(packetHash, "future_dated");
            }

            // ── Stage 4: Settlement ──
            Transaction tx = settlement.execute(instruction, packetHash, bridgeNodeId, hopCount);
            return PipelineResult.settled(packetHash, tx);

        } catch (Exception ex) {
            log.error("Pipeline error: {}", ex.getMessage(), ex);
            return PipelineResult.invalid("?", "internal_error: " + ex.getMessage());
        }
    }

    /** Outcome of processing a single mesh packet through the pipeline. */
    public record PipelineResult(String outcome, String packetHash, String reason, Long transactionId) {

        public static PipelineResult settled(String hash, Transaction tx) {
            return new PipelineResult("SETTLED", hash, null, tx.getId());
        }

        public static PipelineResult duplicate(String hash) {
            return new PipelineResult("DUPLICATE_DROPPED", hash, null, null);
        }

        public static PipelineResult invalid(String hash, String reason) {
            return new PipelineResult("INVALID", hash, reason, null);
        }
    }
}
