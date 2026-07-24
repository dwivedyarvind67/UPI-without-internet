"use client";

import React, { useState } from "react";
import { ArrowRight, Smartphone, RefreshCw, Send, Trash2, Globe } from "lucide-react";
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


  // Input states
  const [senderVpa, setSenderVpa] = useState("alice@arvind");
  const [receiverVpa, setReceiverVpa] = useState("bob@arvind");
  const [amount, setAmount] = useState<number>(500);
  const [pin, setPin] = useState("1234");

  // Custom account input states
  const [customVpaInput, setCustomVpaInput] = useState("");
  const [customHolderInput, setCustomHolderInput] = useState("");
  const [customBalanceInput, setCustomBalanceInput] = useState<number>(1000);
  const [showCustomRegister, setShowCustomRegister] = useState(false);

  // Log feed state
  const [logs, setLogs] = useState<string[]>([
    "Simulator initiated. Ledger seeded with starting balances.",
    "Topology generated: 4 offline nodes, 1 online bridge node."
  ]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev]);
  };

  // Dynamic backend API poller
  const refreshState = async () => {
    try {
      // 1. Fetch live accounts
      const accRes = await fetch("/api/accounts");
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(
          accData.map((a: any) => ({
            vpa: a.vpa,
            holder: a.holderName,
            balance: a.balance
          }))
        );
      }

      // 2. Fetch live mesh network state
      const meshRes = await fetch("/api/mesh/state");
      if (meshRes.ok) {
        const meshData = await meshRes.json();
        // Map backend devices (phone-alice, phone-stranger1, etc.)
        const nameMap: Record<string, string> = {
          "phone-alice": "Alice's Phone",
          "phone-stranger1": "Stranger Hub 1",
          "phone-stranger2": "Stranger Hub 2",
          "phone-stranger3": "Stranger Hub 3",
          "phone-bridge": "Bridge Terminal (4G)"
        };
        setDevices(
          meshData.devices.map((d: any) => ({
            id: d.deviceId,
            name: nameMap[d.deviceId] || d.deviceId,
            hasInternet: d.hasInternet,
            packets: d.packetIds
          }))
        );
        // Sync cache size
        setDedupCache(new Set(new Array(meshData.idempotencyCacheSize)));
      }

      // 3. Fetch live transactions
      const txRes = await fetch("/api/transactions");
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(
          txData.map((t: any) => ({
            id: t.id,
            hash: t.packetHash.substring(0, 14) + "...",
            sender: t.senderVpa,
            receiver: t.receiverVpa,
            amount: t.amount,
            bridge: t.bridgeNodeId,
            hops: t.hopCount,
            outcome: t.outcome,
            timestamp: new Date(t.settledAt).toLocaleTimeString()
          }))
        );
      }
    } catch (e) {
      // Backend might be offline
    }
  };

  // Initial and periodic state refresh
  React.useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterAccount = async () => {
    if (!customVpaInput.includes("@")) {
      addLog("ERROR: VPA must be in a valid format containing '@' (e.g. arvind@arvind).");
      return;
    }
    if (!customHolderInput.trim()) {
      addLog("ERROR: Account Holder Name cannot be empty.");
      return;
    }
    if (accounts.some((a) => a.vpa === customVpaInput.trim())) {
      addLog("ERROR: VPA already exists in ledger.");
      return;
    }

    // Direct registration note: in this demo, accounts are loaded on backend startup. 
    // We append locally for custom selections and then let the backend transaction pipeline settle them.
    const newAcc: SimulatedAccount = {
      vpa: customVpaInput.trim().toLowerCase(),
      holder: customHolderInput.trim(),
      balance: customBalanceInput
    };

    setAccounts((prev) => [...prev, newAcc]);
    addLog(`REGISTERED locally: Custom VPA ${newAcc.vpa} added. Proceeding to inject payment.`);
    
    setSenderVpa(newAcc.vpa);
    setCustomVpaInput("");
    setCustomHolderInput("");
    setCustomBalanceInput(1000);
    setShowCustomRegister(false);
  };

  // Inject a payment packet into phone-alice (Real API)
  const handleInject = async () => {
    if (senderVpa === receiverVpa) {
      addLog("ERROR: Sender and receiver VPAs cannot be identical.");
      return;
    }
    if (amount <= 0) {
      addLog("ERROR: Amount must be greater than zero.");
      return;
    }

    try {
      const res = await fetch("/api/demo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderVpa,
          receiverVpa,
          amount,
          pin,
          ttl: 5,
          startDevice: "phone-alice"
        })
      });

      if (res.ok) {
        const data = await res.json();
        addLog(`SUCCESS: Packet ${data.packetId.substring(0, 8).toUpperCase()} encrypted via RSA-OAEP + AES-GCM and injected at phone-alice.`);
        addLog(`   Ciphertext: ${data.ciphertextPreview}`);
        refreshState();
      } else {
        addLog("ERROR: Failed to inject payment packet.");
      }
    } catch (e) {
      addLog("ERROR: Backend API server unreachable.");
    }
  };

  // Run a gossip propagation step (Real API)
  const handleGossip = async () => {
    try {
      const res = await fetch("/api/mesh/gossip", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addLog(`GOSSIP: Propagation round completed. ${data.transfers} packet hops processed across devices.`);
        refreshState();
      } else {
        addLog("ERROR: Failed to run gossip round.");
      }
    } catch (e) {
      addLog("ERROR: Backend API server unreachable.");
    }
  };

  // Bridge uploads and settles (Real API)
  const handleFlush = async () => {
    try {
      const res = await fetch("/api/mesh/flush", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        addLog(`UPLOAD: Bridge uploaded packets to server. ${data.uploadsAttempted} upload(s) processed.`);
        data.results.forEach((r: any) => {
          addLog(`   Node: ${r.bridgeNode} | Packet: ${r.packetId.toUpperCase()} | Result: ${r.outcome}`);
        });
        refreshState();
      } else {
        addLog("ERROR: Failed to upload from bridge.");
      }
    } catch (e) {
      addLog("ERROR: Backend API server unreachable.");
    }
  };

  // Reset mesh simulation state (Real API)
  const handleReset = async () => {
    try {
      const res = await fetch("/api/mesh/reset", { method: "POST" });
      if (res.ok) {
        addLog("RESET: Clear signal sent. Backend network state and deduplication registers purged.");
        refreshState();
      } else {
        addLog("ERROR: Failed to clear backend cache.");
      }
    } catch (e) {
      addLog("ERROR: Backend API server unreachable.");
    }
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
                  Sender VPA (Editable)
                </label>
                <input
                  type="text"
                  value={senderVpa}
                  onChange={(e) => setSenderVpa(e.target.value)}
                  placeholder="alice@arvind"
                  className="w-full text-xs"
                />
                <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-mono text-[var(--text-muted)]">
                  <span>Quick pick:</span>
                  {accounts.slice(0, 3).map((a) => (
                    <button
                      key={a.vpa}
                      type="button"
                      onClick={() => setSenderVpa(a.vpa)}
                      className="underline hover:text-[var(--accent)] cursor-pointer mr-1.5"
                    >
                      {a.vpa.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Receiver VPA (Editable)
                </label>
                <input
                  type="text"
                  value={receiverVpa}
                  onChange={(e) => setReceiverVpa(e.target.value)}
                  placeholder="bob@arvind"
                  className="w-full text-xs"
                />
                <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-mono text-[var(--text-muted)]">
                  <span>Quick pick:</span>
                  {accounts.slice(0, 4).map((a) => (
                    <button
                      key={a.vpa}
                      type="button"
                      onClick={() => setReceiverVpa(a.vpa)}
                      className="underline hover:text-[var(--accent)] cursor-pointer mr-1.5"
                    >
                      {a.vpa.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Account Registration Drawer */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowCustomRegister(!showCustomRegister)}
                className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider underline cursor-pointer"
              >
                {showCustomRegister ? "Hide Registration Form" : "Register Custom VPA (Real ID)"}
              </button>

              {showCustomRegister && (
                <div className="mt-4 p-4 hairline-border rounded-[4px] bg-[rgba(20,33,61,0.02)] space-y-3">
                  <h4 className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-wider font-semibold">
                    New Account Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-[var(--text-muted)] mb-1">
                        Holder Name (e.g. Arvind Dwivedi)
                      </label>
                      <input
                        type="text"
                        value={customHolderInput}
                        onChange={(e) => setCustomHolderInput(e.target.value)}
                        placeholder="Arvind Dwivedi"
                        className="w-full text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-[var(--text-muted)] mb-1">
                        Custom VPA (e.g. arvind@arvind)
                      </label>
                      <input
                        type="text"
                        value={customVpaInput}
                        onChange={(e) => setCustomVpaInput(e.target.value)}
                        placeholder="arvind@arvind"
                        className="w-full text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-[var(--text-muted)] mb-1">
                        Starting Balance (₹)
                      </label>
                      <input
                        type="number"
                        value={customBalanceInput}
                        onChange={(e) => setCustomBalanceInput(Number(e.target.value))}
                        className="w-full text-xs py-1"
                      />
                    </div>
                  </div>
                  <Button variant="secondary" onClick={handleRegisterAccount} className="mt-1">
                    Add Account to Ledger
                  </Button>
                </div>
              )}
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
                <div key={idx} className="border-b border-[var(--border)] pb-1 last:border-0">
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
