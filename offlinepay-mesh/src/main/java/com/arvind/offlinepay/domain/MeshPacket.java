package com.arvind.offlinepay.domain;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * The over-the-wire format for a payment traveling through the mesh.
 *
 * Outer fields (packetId, ttl, createdAt) are visible to intermediate relay
 * devices — they need them for routing decisions and gossip dedup. The
 * ciphertext field is fully opaque: encrypted with the server's RSA public
 * key, so no relay can read or tamper with it.
 *
 * We use the ciphertext's SHA-256 hash as the server-side idempotency key
 * (not packetId), because a malicious relay could rewrite packetId but
 * cannot forge a valid ciphertext.
 *
 * @author Arvind Dwivedi
 */
public class MeshPacket {

    @NotBlank
    private String packetId;

    @Min(0)
    private int ttl;

    @NotNull
    private Long createdAt;

    @NotBlank
    private String ciphertext;

    public MeshPacket() {}

    public MeshPacket(String packetId, int ttl, Long createdAt, String ciphertext) {
        this.packetId = packetId;
        this.ttl = ttl;
        this.createdAt = createdAt;
        this.ciphertext = ciphertext;
    }

    public String getPacketId() { return packetId; }
    public void setPacketId(String packetId) { this.packetId = packetId; }

    public int getTtl() { return ttl; }
    public void setTtl(int ttl) { this.ttl = ttl; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public String getCiphertext() { return ciphertext; }
    public void setCiphertext(String ciphertext) { this.ciphertext = ciphertext; }
}
