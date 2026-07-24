package com.arvind.offlinepay.api;

import com.arvind.offlinepay.domain.*;
import com.arvind.offlinepay.engine.*;
import com.arvind.offlinepay.security.KeyManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

/**
 * REST API surface for the offline payment mesh system.
 *
 * Endpoints organized into four groups:
 *   /api/server-key              → public key for sender-side encryption
 *   /api/demo/*                  → simulation helpers
 *   /api/mesh/*                  → mesh simulator controls
 *   /api/bridge/ingest           → THE production endpoint
 *   /api/accounts, /api/transactions → dashboard data feeds
 *
 * @author Arvind Dwivedi
 */
@RestController
@RequestMapping("/api")
public class PaymentController {

    private final KeyManager keyManager;
    private final PacketFactory packetFactory;
    private final MeshEngine meshEngine;
    private final IngestionPipeline pipeline;
    private final AccountRepository accountRepo;
    private final TransactionRepository transactionRepo;
    private final DeduplicationService dedup;

    public PaymentController(KeyManager keyManager, PacketFactory packetFactory,
                             MeshEngine meshEngine, IngestionPipeline pipeline,
                             AccountRepository accountRepo, TransactionRepository transactionRepo,
                             DeduplicationService dedup) {
        this.keyManager = keyManager;
        this.packetFactory = packetFactory;
        this.meshEngine = meshEngine;
        this.pipeline = pipeline;
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.dedup = dedup;
    }

    // ──────────────────────────────────────────── Server Key

    @GetMapping("/server-key")
    public Map<String, String> serverKey() {
        return Map.of(
                "publicKey", keyManager.publicKeyBase64(),
                "algorithm", "RSA-2048 / OAEP-SHA256",
                "hybridScheme", "RSA-OAEP wraps an AES-256-GCM session key"
        );
    }

    // ──────────────────────────────────────────── Demo Simulation

    @PostMapping("/demo/send")
    public ResponseEntity<?> simulateSend(@RequestBody SendRequest req) throws Exception {
        MeshPacket packet = packetFactory.buildPacket(
                req.senderVpa, req.receiverVpa, req.amount, req.pin,
                req.ttl != null ? req.ttl : 5);

        String startDevice = req.startDevice != null ? req.startDevice : "phone-alice";
        meshEngine.inject(startDevice, packet);

        return ResponseEntity.ok(Map.of(
                "packetId", packet.getPacketId(),
                "ciphertextPreview", packet.getCiphertext().substring(0, 64) + "...",
                "ttl", packet.getTtl(),
                "injectedAt", startDevice
        ));
    }

    public static class SendRequest {
        public String senderVpa;
        public String receiverVpa;
        public BigDecimal amount;
        public String pin;
        public Integer ttl;
        public String startDevice;
    }

    // ──────────────────────────────────────────── Mesh Controls

    @GetMapping("/mesh/state")
    public Map<String, Object> meshState() {
        List<Map<String, Object>> deviceData = new ArrayList<>();
        for (VirtualDevice d : meshEngine.allDevices()) {
            deviceData.add(Map.of(
                    "deviceId", d.getDeviceId(),
                    "hasInternet", d.isConnectedToInternet(),
                    "packetCount", d.packetCount(),
                    "packetIds", d.allPackets().stream()
                            .map(p -> p.getPacketId().substring(0, 8))
                            .toList()
            ));
        }
        return Map.of(
                "devices", deviceData,
                "idempotencyCacheSize", dedup.cacheSize()
        );
    }

    @PostMapping("/mesh/gossip")
    public Map<String, Object> gossip() {
        MeshEngine.GossipSummary result = meshEngine.runGossipRound();
        return Map.of(
                "transfers", result.transfers(),
                "deviceCounts", result.deviceCounts()
        );
    }

    @PostMapping("/mesh/flush")
    public Map<String, Object> flushBridges() {
        List<MeshEngine.BridgePayload> payloads = meshEngine.collectBridgePayloads();

        List<Map<String, Object>> results = new ArrayList<>();
        payloads.parallelStream().forEach(payload -> {
            IngestionPipeline.PipelineResult r = pipeline.process(
                    payload.packet(), payload.bridgeNodeId(),
                    5 - payload.packet().getTtl());
            synchronized (results) {
                results.add(Map.of(
                        "bridgeNode", payload.bridgeNodeId(),
                        "packetId", payload.packet().getPacketId().substring(0, 8),
                        "outcome", r.outcome(),
                        "reason", r.reason() == null ? "" : r.reason(),
                        "transactionId", r.transactionId() == null ? -1 : r.transactionId()
                ));
            }
        });

        return Map.of(
                "uploadsAttempted", payloads.size(),
                "results", results
        );
    }

    @PostMapping("/mesh/reset")
    public Map<String, Object> resetMesh() {
        meshEngine.resetAll();
        dedup.clearAll();
        return Map.of("status", "mesh and deduplication cache cleared");
    }

    // ──────────────────────────────────────────── Bridge Ingestion (Production)

    @PostMapping("/bridge/ingest")
    public ResponseEntity<?> ingestFromBridge(
            @RequestBody MeshPacket packet,
            @RequestHeader(value = "X-Bridge-Node-Id", defaultValue = "unknown") String bridgeNodeId,
            @RequestHeader(value = "X-Hop-Count", defaultValue = "0") int hopCount) {

        IngestionPipeline.PipelineResult result = pipeline.process(packet, bridgeNodeId, hopCount);
        return ResponseEntity.ok(result);
    }

    // ──────────────────────────────────────────── Dashboard Data

    @GetMapping("/accounts")
    public List<Account> accounts() {
        return accountRepo.findAll();
    }

    @GetMapping("/transactions")
    public List<Transaction> transactions() {
        return transactionRepo.findTop20ByOrderByIdDesc();
    }
}
