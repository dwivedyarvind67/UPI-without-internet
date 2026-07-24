package com.arvind.offlinepay.engine;

import com.arvind.offlinepay.domain.MeshPacket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simulates a Bluetooth Low Energy mesh network for offline payment routing.
 *
 * Manages a set of virtual devices (phones). The gossip step broadcasts
 * packets between nearby devices — for demo simplicity, all devices are
 * considered "within range." TTL decrements with each hop.
 *
 * @author Arvind Dwivedi
 */
@Service
public class MeshEngine {

    private static final Logger log = LoggerFactory.getLogger(MeshEngine.class);

    private final Map<String, VirtualDevice> network = new ConcurrentHashMap<>();

    public MeshEngine() {
        initializeDefaultTopology();
    }

    private void initializeDefaultTopology() {
        network.put("phone-alice",     new VirtualDevice("phone-alice",     false));
        network.put("phone-stranger1", new VirtualDevice("phone-stranger1", false));
        network.put("phone-stranger2", new VirtualDevice("phone-stranger2", false));
        network.put("phone-stranger3", new VirtualDevice("phone-stranger3", false));
        network.put("phone-bridge",    new VirtualDevice("phone-bridge",    true));
    }

    public Collection<VirtualDevice> allDevices() {
        return network.values();
    }

    public VirtualDevice device(String id) {
        return network.get(id);
    }

    public void inject(String deviceId, MeshPacket packet) {
        VirtualDevice target = network.get(deviceId);
        if (target == null) {
            throw new IllegalArgumentException("Device not found in mesh: " + deviceId);
        }
        target.receive(packet);
        log.info("Packet {} injected at {} with TTL={}",
                packet.getPacketId().substring(0, 8), deviceId, packet.getTtl());
    }

    /**
     * Runs one round of gossip propagation across the mesh.
     */
    public GossipSummary runGossipRound() {
        int transferCount = 0;
        List<VirtualDevice> deviceList = new ArrayList<>(network.values());

        Map<String, List<MeshPacket>> snapshot = new HashMap<>();
        for (VirtualDevice device : deviceList) {
            snapshot.put(device.getDeviceId(), new ArrayList<>(device.allPackets()));
        }

        for (VirtualDevice source : deviceList) {
            for (MeshPacket packet : snapshot.get(source.getDeviceId())) {
                if (packet.getTtl() <= 0) continue;

                for (VirtualDevice destination : deviceList) {
                    if (destination == source) continue;
                    if (destination.alreadyHas(packet.getPacketId())) continue;

                    MeshPacket hopCopy = new MeshPacket();
                    hopCopy.setPacketId(packet.getPacketId());
                    hopCopy.setTtl(packet.getTtl() - 1);
                    hopCopy.setCreatedAt(packet.getCreatedAt());
                    hopCopy.setCiphertext(packet.getCiphertext());
                    destination.receive(hopCopy);
                    transferCount++;
                }
            }
        }

        log.info("Gossip round completed: {} packet transfer(s)", transferCount);
        return new GossipSummary(transferCount, buildDeviceCountMap());
    }

    public List<BridgePayload> collectBridgePayloads() {
        List<BridgePayload> payloads = new ArrayList<>();
        for (VirtualDevice device : network.values()) {
            if (!device.isConnectedToInternet()) continue;
            for (MeshPacket packet : device.allPackets()) {
                payloads.add(new BridgePayload(device.getDeviceId(), packet));
            }
        }
        return payloads;
    }

    public Map<String, Integer> buildDeviceCountMap() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (VirtualDevice device : network.values()) {
            counts.put(device.getDeviceId(), device.packetCount());
        }
        return counts;
    }

    public void resetAll() {
        network.values().forEach(VirtualDevice::clearAll);
    }

    public record GossipSummary(int transfers, Map<String, Integer> deviceCounts) {}
    public record BridgePayload(String bridgeNodeId, MeshPacket packet) {}
}
