"use client";

import React, { useState } from "react";
import { ArrowRight, Smartphone, RefreshCw, Send, Trash2, HelpCircle, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Models
interface SimulatedDevice {
  id: string;
  name: string;
  hasInternet: boolean;
  packets: string[]; // List of packet IDs held
}

interface SimulatedAccount {
  vpa: string;
  holder: string;
  balance: number;
}

interface SimulatedTransaction {
  id: number;
  hash: string;
  sender: string;
  receiver: string;
  amount: number;
  bridge: string;
  hops: number;
  outcome: "SETTLED" | "REJECTED" | "DUPLICATE_DROPPED" | "INVALID";
  timestamp: string;
}

interface EncryptedPacket {
  id: string;
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  pin: string;
  nonce: string;
  ttl: number;
  createdAt: number;
  ciphertextHash: string;
}

export default function DemoPage() {
  // Accounts state
  const [accounts, setAccounts] = useState<SimulatedAccount[]>([
    { vpa: "alice@arvind", holder: "Alice", balance: 5000.0 },
    { vpa: "bob@arvind", holder: "Bob", balance: 1000.0 },
    { vpa: "carol@arvind", holder: "Carol", balance: 2500.0 },
    { vpa: "dave@arvind", holder: "Dave", balance: 500.0 }
  ]);

  // Network State
  const [devices, setDevices] = useState<SimulatedDevice[]>([
    { id: "phone-alice", name: "Alice's Phone", hasInternet: false, packets: [] },
    { id: "phone-stranger1", name: "Stranger Hub 1", hasInternet: false, packets: [] },
    { id: "phone-stranger2", name: "Stranger Hub 2", hasInternet: false, packets: [] },
    { id: "phone-stranger3", name: "Stranger Hub 3", hasInternet: false, packets: [] },
    { id: "phone-bridge", name: "Bridge Terminal (4G)", hasInternet: true, packets: [] }
  ]);

  // Transaction Ledger & Deduplication Cache
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([]);
  const [dedupCache, setDedupCache] = useState<Set<string>>(new Set());
  const [activePackets, setActivePackets] = useState<Map<string, EncryptedPacket>>(new Map());

  // Input states
  const [senderVpa, setSenderVpa] = useState("alice@arvind");
  const [receiverVpa, setReceiverVpa] = useState("bob@arvind");
  const [amount, setAmount] = useState<number>(500);
  const [pin, setPin] = useState("1234");

  // Log feed state
  const [logs, setLogs] = useState<string[]>([
    "Simulator initiated. Ledger seeded with starting balances.",
    "Topology generated: 4 offline nodes, 1 online bridge node."
  ]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev]);
  };

  // Inject a payment packet into phone-alice
  const handleInject = () => {
    if (senderVpa === receiverVpa) {
      addLog("ERROR: Sender and receiver VPAs cannot be identical.");
      return;
    }
    if (amount <= 0) {
      addLog("ERROR: Amount must be greater than zero.");
      return;
    }

    // Check balance first (client pre-check, though server validates)
    const sender = accounts.find((a) => a.vpa === senderVpa);
    if (!sender || sender.balance < amount) {
      addLog(`WARNING: Sender ${senderVpa} has insufficient funds. Packet will still propagate but may be REJECTED during settlement.`);
    }

    const packetId = Math.random().toString(36).substring(2, 10);
    const nonce = Math.random().toString(36).substring(2, 12);
    // Mimic the hash of the ciphertext
    const ciphertextHash = "sha256_" + Math.random().toString(36).substring(2, 14);

    const newPacket: EncryptedPacket = {
      id: packetId,
      senderVpa,
      receiverVpa,
      amount,
      pin,
      nonce,
      ttl: 5,
      createdAt: Date.now(),
      ciphertextHash
    };

    // Store the packet in our global map
    setActivePackets((prev) => {
      const next = new Map(prev);
      next.set(packetId, newPacket);
      return next;
    });

    // Alice holds it first
    setDevices((prevDevices) =>
      prevDevices.map((d) =>
        d.id === "phone-alice"
          ? { ...d, packets: [...d.packets, packetId] }
          : d
      )
    );

    addLog(
      `Packet ${packetId.toUpperCase()} encrypted via RSA-OAEP + AES-GCM and injected at phone-alice. TTL: 5.`
    );
  };

  // Run a gossip propagation step
  const handleGossip = () => {
    let transfers = 0;
    const currentDevices = [...devices];
    const newDevices = currentDevices.map((d) => ({ ...d, packets: [...d.packets] }));

    // Gossip rounds
    for (let sourceIdx = 0; sourceIdx < currentDevices.length; sourceIdx++) {
      const source = currentDevices[sourceIdx];
      for (const packetId of source.packets) {
        const packet = activePackets.get(packetId);
        if (!packet || packet.ttl <= 0) continue;

        // Spread to all other devices
        for (let targetIdx = 0; targetIdx < currentDevices.length; targetIdx++) {
          if (sourceIdx === targetIdx) continue;
          const target = newDevices[targetIdx];

          if (!target.packets.includes(packetId)) {
            // Decrement TTL dynamically
            packet.ttl = Math.max(0, packet.ttl - 1);
            target.packets.push(packetId);
            transfers++;
          }
        }
      }
    }

    setDevices(newDevices);

    if (transfers > 0) {
      addLog(`Gossip Round Completed: Broadcasted packets to nearby peer devices. ${transfers} packet hops made.`);
    } else {
      addLog("Gossip Round: No propagation. Packets have either reached maximum hops or all nodes hold copies.");
    }
  };

  // Bridge uploads and settles
  const handleFlush = () => {
    const bridge = devices.find((d) => d.hasInternet);
    if (!bridge || bridge.packets.length === 0) {
      addLog("Upload Attempt: No packets currently stored on online bridge nodes.");
      return;
    }

    const packetsToUpload = [...bridge.packets];
    addLog(`Bridge ${bridge.id.toUpperCase()} walked into 4G range. Uploading ${packetsToUpload.length} packet(s)...`);

    packetsToUpload.forEach((packetId) => {
      const packet = activePackets.get(packetId);
      if (!packet) return;

      const hash = packet.ciphertextHash;

      // Deduplication check
      if (dedupCache.has(hash)) {
        addLog(`DUPLICATE DROPPED: Server rejected packet ${packetId.toUpperCase()} (Hash already exists in idempotency cache).`);
        setTransactions((prev) => [
          {
            id: prev.length + 1,
            hash: hash.substring(0, 14) + "...",
            sender: packet.senderVpa,
            receiver: packet.receiverVpa,
            amount: packet.amount,
            bridge: bridge.name,
            hops: 5 - packet.ttl,
            outcome: "DUPLICATE_DROPPED",
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        return;
      }

      // Add to dedup cache
      setDedupCache((prev) => {
        const next = new Set(prev);
        next.add(hash);
        return next;
      });

      // Settlement logic
      const sender = accounts.find((a) => a.vpa === packet.senderVpa);
      const receiver = accounts.find((a) => a.vpa === packet.receiverVpa);

      if (!sender || !receiver) {
        addLog(`SETTLEMENT INVALID: VPAs associated with packet ${packetId.toUpperCase()} do not exist.`);
        return;
      }

      let outcome: "SETTLED" | "REJECTED" = "SETTLED";
      if (sender.balance < packet.amount) {
        outcome = "REJECTED";
        addLog(`SETTLEMENT REJECTED: Insufficient balance on account ${packet.senderVpa} for payment ${packetId.toUpperCase()}.`);
      } else {
        // Transfer money
        setAccounts((prevAccounts) =>
          prevAccounts.map((a) => {
            if (a.vpa === packet.senderVpa) {
              return { ...a, balance: a.balance - packet.amount };
            }
            if (a.vpa === packet.receiverVpa) {
              return { ...a, balance: a.balance + packet.amount };
            }
            return a;
          })
        );
        addLog(`SETTLED: Transferred ₹${packet.amount.toFixed(2)} from ${packet.senderVpa} to ${packet.receiverVpa}. Transaction logged.`);
      }

      setTransactions((prev) => [
        {
          id: prev.length + 1,
          hash: hash.substring(0, 14) + "...",
          sender: packet.senderVpa,
          receiver: packet.receiverVpa,
          amount: packet.amount,
          bridge: bridge.name,
          hops: 5 - packet.ttl,
          outcome,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    });

    // Clear bridge packets once uploaded
    setDevices((prevDevices) =>
      prevDevices.map((d) => (d.hasInternet ? { ...d, packets: [] } : d))
    );
  };

  // Reset mesh simulation state
  const handleReset = () => {
    setDevices((prevDevices) => prevDevices.map((d) => ({ ...d, packets: [] })));
    setTransactions([]);
    setDedupCache(new Set());
    setActivePackets(new Map());
    addLog("Simulator reset. Network states, deduplication registers, and ledgers cleared.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
      <SectionHeading
        title="Interactive Mesh Simulator"
        subtitle="Test the cryptographic payment routing pipeline live in your browser. Perform steps sequentially to trace how duplicate packets are resolved."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Flow Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-serif text-base text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--text-muted)]">STEP 01</span>
              Compose & Inject Payment Packet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Sender Account
                </label>
                <select
                  value={senderVpa}
                  onChange={(e) => setSenderVpa(e.target.value)}
                  className="w-full"
                >
                  <option value="alice@arvind">Alice (alice@arvind)</option>
                  <option value="bob@arvind">Bob (bob@arvind)</option>
                  <option value="carol@arvind">Carol (carol@arvind)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Receiver Account
                </label>
                <select
                  value={receiverVpa}
                  onChange={(e) => setReceiverVpa(e.target.value)}
                  className="w-full"
                >
                  <option value="bob@arvind">Bob (bob@arvind)</option>
                  <option value="carol@arvind">Carol (carol@arvind)</option>
                  <option value="alice@arvind">Alice (alice@arvind)</option>
                  <option value="dave@arvind">Dave (dave@arvind)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Security PIN
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleInject} className="gap-1">
                <Send className="w-3.5 h-3.5" /> Inject into Alice's Phone
              </Button>
            </div>
          </Card>

          {/* Steps 2 and 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-serif text-base text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">STEP 02</span>
                Gossip Propagation
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                Broadcast packets stored on peer devices. Each round copies packets to neighboring peers and reduces remaining hops.
              </p>
              <Button variant="secondary" onClick={handleGossip} className="w-full gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Run Gossip Round
              </Button>
            </Card>

            <Card>
              <h3 className="font-serif text-base text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">STEP 03</span>
                Upload & Settle
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                Simulate the bridge node entering internet range. Bridge uploads all packets to the backend to resolve settlement.
              </p>
              <Button variant="secondary" onClick={handleFlush} className="w-full gap-1">
                <Globe className="w-3.5 h-3.5" /> Upload to Backend
              </Button>
            </Card>
          </div>

          {/* Mesh Visualization */}
          <Card>
            <h3 className="font-serif text-base text-[var(--text-primary)] mb-6">
              Active Mesh Topography
            </h3>
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 hairline-border rounded-[4px] bg-[rgba(20,33,61,0.01)] ${
                    device.hasInternet ? "border-[var(--accent)]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className={`w-4 h-4 ${device.hasInternet ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                    <div>
                      <span className="text-xs font-serif font-medium">{device.name}</span>
                      <span className="block text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                        {device.id}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0 flex items-center gap-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {device.packets.length > 0 ? (
                        device.packets.map((pid) => (
                          <span key={pid} className="packet-id uppercase">
                            pkt: {pid}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          NO PACKETS HELD
                        </span>
                      )}
                    </div>
                    <Badge status={device.hasInternet ? "active" : "idle"}>
                      {device.hasInternet ? "Online Bridge" : "Offline"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Balance Panel & Ledger */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-serif text-base text-[var(--text-primary)] mb-4">
              Ledger Balances
            </h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Holder</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)] text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.vpa}>
                    <td className="py-2.5">
                      <span className="text-xs font-medium block">{acc.holder}</span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                        {acc.vpa}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs font-semibold text-[var(--accent)]">
                      ₹{acc.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-3 hairline-border-t text-[10px] font-mono text-[var(--text-muted)] uppercase">
              Idempotency cache size: {dedupCache.size} entry(ies)
            </div>
          </Card>

          {/* Control resets */}
          <Button variant="secondary" onClick={handleReset} className="w-full gap-1 border-dashed">
            <Trash2 className="w-3.5 h-3.5" /> Purge Cache & Network States
          </Button>

          {/* Activity Logs */}
          <Card className="flex flex-col">
            <h3 className="font-serif text-base text-[var(--text-primary)] mb-3">
              Activity Console
            </h3>
            <div id="log" className="flex-1 overflow-y-auto max-h-[250px] font-mono text-[10px] space-y-2">
              {logs.map((logStr, idx) => (
                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-1 last:border-0">
                  {logStr}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction Ledger Grid */}
      <div className="mt-8">
        <Card>
          <h3 className="font-serif text-base text-[var(--text-primary)] mb-6">
            Settlement Ledger History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">ID</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Payload Hash</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Sender</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Receiver</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Amount</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Bridge</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Hops</th>
                  <th className="font-mono text-[10px] text-[var(--text-muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 font-mono text-xs">{tx.id}</td>
                      <td className="py-3 font-mono text-xs text-[var(--text-muted)]">{tx.hash}</td>
                      <td className="py-3 font-mono text-xs">{tx.sender}</td>
                      <td className="py-3 font-mono text-xs">{tx.receiver}</td>
                      <td className="py-3 font-mono text-xs font-semibold">₹{tx.amount.toFixed(2)}</td>
                      <td className="py-3 font-mono text-xs text-[var(--text-muted)]">{tx.bridge}</td>
                      <td className="py-3 font-mono text-xs">{tx.hops}</td>
                      <td className="py-3 text-xs">
                        <span className={`status-${tx.outcome} uppercase font-mono font-semibold`}>
                          {tx.outcome.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs font-mono text-[var(--text-muted)]">
                      NO SETTLED TRANSACTIONS RECORDED. INJECT A PAYMENT PACKET TO BEGIN.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
