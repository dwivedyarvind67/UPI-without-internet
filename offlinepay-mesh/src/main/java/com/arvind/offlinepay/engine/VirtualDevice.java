package com.arvind.offlinepay.engine;

import com.arvind.offlinepay.domain.MeshPacket;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Represents a single phone in the simulated Bluetooth mesh network.
 * Each device maintains a local store of packets it has received via gossip.
 *
 * In the real system, this state would live on an actual Android device,
 * with packets exchanged via BLE GATT characteristics or Wi-Fi Direct.
 *
 * @author Arvind Dwivedi
 */
public class VirtualDevice {

    private final String deviceId;
    private final boolean connectedToInternet;
    private final Map<String, MeshPacket> packetStore = new ConcurrentHashMap<>();

    public VirtualDevice(String deviceId, boolean connectedToInternet) {
        this.deviceId = deviceId;
        this.connectedToInternet = connectedToInternet;
    }

    public String getDeviceId() { return deviceId; }
    public boolean isConnectedToInternet() { return connectedToInternet; }

    /** Accepts a packet if not already held (gossip dedup at device level). */
    public void receive(MeshPacket packet) {
        packetStore.putIfAbsent(packet.getPacketId(), packet);
    }

    public boolean alreadyHas(String packetId) {
        return packetStore.containsKey(packetId);
    }

    public Collection<MeshPacket> allPackets() {
        return packetStore.values();
    }

    public int packetCount() {
        return packetStore.size();
    }

    public void clearAll() {
        packetStore.clear();
    }
}
