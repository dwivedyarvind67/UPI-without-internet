import React from "react";
import { Shield, Key, Share2, Radio, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: <Key className="w-5 h-5 text-[var(--accent)]" />,
      title: "Sign & Encrypt Locally",
      desc: "The sender enters the amount and PIN on their offline device. The application constructs a payment instruction containing a unique payment UUID (nonce) and epoch signature timestamp. This payload is encrypted locally using the backend's cached RSA public key via hybrid AES-256-GCM encryption."
    },
    {
      num: "02",
      icon: <Share2 className="w-5 h-5 text-[var(--accent)]" />,
      title: "Peer-to-Peer Gossip Propagation",
      desc: "The phone broadcasts the encrypted payload via Bluetooth Low Energy. Nearby devices receiving the payload store it and replicate it to other peers they encounter. The payload hops from phone to phone. Each relay hop decrements the packet's Time-To-Live (TTL) register to control propagation spam."
    },
    {
      num: "03",
      icon: <Radio className="w-5 h-5 text-[var(--accent)]" />,
      title: "Bridge Upload Ingestion",
      desc: "A peer node containing the packet (a 'bridge') walks into an area with active cellular (4G/5G) or Wi-Fi connectivity. The bridge node automatically flushes all local mesh packets by uploading them to the backend server's ingestion REST endpoint (/api/bridge/ingest)."
    },
    {
      num: "04",
      icon: <Shield className="w-5 h-5 text-[var(--accent)]" />,
      title: "Deduplication & Verification Gate",
      desc: "The backend server computes the SHA-256 hash of the uploaded ciphertext. It attempts to atomically register this hash in its in-memory compare-and-set deduplication registry (equivalent to a Redis SETNX command). Duplicate uploads from parallel bridges are instantly short-circuited here."
    },
    {
      num: "05",
      icon: <Server className="w-5 h-5 text-[var(--accent)]" />,
      title: "Decryption & Final Settlement",
      desc: "If the packet is unique, the server decrypts the ciphertext using its private RSA key, checks the payload's timestamp signature to prevent old replay attacks, validates the user's PIN, and atomically updates the bank ledger (sender debit, receiver credit) under a strict database transaction."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
      <SectionHeading
        title="Technical Protocol Specification"
        subtitle="Detailed walkthrough of the deferred cryptographic settlement pipeline. This protocol solves offline security, data integrity, and duplicate propagation storm challenges."
      />

      {/* Dotted Route Visual Motif Header */}
      <div className="relative py-8 my-8 hairline-border bg-[rgba(20,33,61,0.01)] rounded-[4px] px-6 text-center">
        <div className="absolute inset-0 dotted-route opacity-10" />
        <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase block mb-3">
          Packet Hop Visualization
        </span>
        <div className="flex items-center justify-center gap-2 md:gap-4 font-mono text-xs text-[var(--text-secondary)]">
          <span>Sender Node (Offline)</span>
          <span className="dashed-route-line w-8 md:w-16 h-[1px]" />
          <span>Strangers (Relays)</span>
          <span className="dashed-route-line w-8 md:w-16 h-[1px]" />
          <span>Bridge Terminal (Online)</span>
          <span className="dashed-route-line w-8 md:w-16 h-[1px]" />
          <span className="text-[var(--accent)] font-semibold">Backend Ledger</span>
        </div>
      </div>

      {/* List Sequence */}
      <div className="space-y-8 mt-12">
        {steps.map((step) => (
          <Card key={step.num} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-[4px] hairline-border font-mono text-xs text-[var(--text-secondary)] bg-[rgba(20,33,61,0.02)]">
                {step.num}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <h3 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
