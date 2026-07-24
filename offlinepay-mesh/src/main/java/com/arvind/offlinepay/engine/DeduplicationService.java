package com.arvind.offlinepay.engine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory deduplication cache that prevents duplicate payment settlement.
 *
 * Uses ConcurrentHashMap.putIfAbsent() as a JVM-local equivalent of
 * Redis SETNX — even if 100 threads call claim() at the exact same
 * nanosecond, exactly ONE gets true (first claimer), the rest get false.
 *
 * This is what kills the "three bridge nodes deliver simultaneously" problem.
 *
 * @author Arvind Dwivedi
 */
@Service
public class DeduplicationService {

    private static final Logger log = LoggerFactory.getLogger(DeduplicationService.class);

    private final Map<String, Instant> claimedHashes = new ConcurrentHashMap<>();

    @Value("${offlinepay.dedup.ttl-seconds:86400}")
    private long ttlSeconds;

    public boolean claim(String packetHash) {
        Instant previous = claimedHashes.putIfAbsent(packetHash, Instant.now());
        return previous == null;
    }

    public int cacheSize() {
        return claimedHashes.size();
    }

    @Scheduled(fixedDelay = 60_000)
    public void evictStaleEntries() {
        Instant cutoff = Instant.now().minusSeconds(ttlSeconds);
        claimedHashes.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
    }

    public void clearAll() {
        claimedHashes.clear();
    }
}
