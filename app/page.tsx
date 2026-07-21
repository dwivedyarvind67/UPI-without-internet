import React from "react";
import Link from "next/link";
import { ArrowRight, Smartphone, Share2, Globe, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatStrip } from "@/components/ui/StatStrip";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 max-w-5xl mx-auto text-center">
        <h1 className="font-serif text-3xl md:text-5xl font-normal text-[var(--text-primary)] leading-tight tracking-tight max-w-4xl mx-auto">
          Send payments in areas with zero connectivity.
        </h1>
        <p className="mt-6 text-sm md:text-base text-[var(--text-secondary)] font-sans max-w-2xl mx-auto leading-relaxed">
          OfflinePay Mesh is a cryptographic protocol demonstrating secure deferred payment settlement.
          Encrypted packets propagate device-to-device through a Bluetooth mesh network until a bridge walks outside and uploads it to the ledger.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/demo">
            <Button variant="primary" className="gap-2">
              Launch Simulator <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="secondary">
              Read Technical Spec
            </Button>
          </Link>
        </div>
      </section>

      {/* Stat Strip */}
      <StatStrip
        stats={[
          "Zero internet required at source",
          "Bluetooth gossip routing",
          "Deferred transaction settlement",
          "Idempotent deduplication cache",
          "Hybrid encryption protection"
        ]}
      />

      {/* Signature Dotted Line Separator */}
      <div className="h-[1px] w-full dashed-route-line opacity-20 my-16" />

      {/* Process Pipeline Overview */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-2xl font-normal text-[var(--text-primary)] tracking-tight">
            The Propagation Pipeline
          </h2>
          <p className="mt-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            How a payment hops to connectivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[var(--text-muted)]">STAGE 01</span>
              <Smartphone className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[var(--text-primary)] mb-2">
              Sign & Encrypt
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The offline sender enters the payment details. The phone signs the transaction and encrypts it using the server's RSA public key via hybrid AES-GCM. The raw payload remains invisible to relays.
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[var(--text-muted)]">STAGE 02</span>
              <Share2 className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[var(--text-primary)] mb-2">
              Gossip Propagation
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The phone broadcasts the encrypted packet over Bluetooth to nearby devices. Each device stores and forwards the packet to other peers, decrementing the time-to-live (TTL) counter with each hop.
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[var(--text-muted)]">STAGE 03</span>
              <Globe className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[var(--text-primary)] mb-2">
              Bridge Ingestion
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When any device holding the packet detects internet connectivity, it uploads the packet to the server. The server verifies freshness, checks for duplicates, and settles the balance atomically.
            </p>
          </Card>
        </div>
      </section>

      {/* Signature Dotted Line Separator */}
      <div className="h-[1px] w-full dashed-route-line opacity-20 mb-20" />

      {/* Factual Integrity Blocks */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[var(--accent)]" />
              <h4 className="font-serif text-lg font-normal text-[var(--text-primary)]">
                Cryptographic Defenses
              </h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Our design enforces end-to-end payload integrity. Intermediaries carry payments but cannot inspect or alter amounts, VPAs, or signatures. Flipped bits trigger decryption failures instantly on the server.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[var(--accent)]" />
              <h4 className="font-serif text-lg font-normal text-[var(--text-primary)]">
                Double-Spend Prevention
              </h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              To stop parallel duplicate settlement (the duplicate-storm problem), the backend implements an atomic compare-and-set key cache using the unique hash of the encrypted payload before executing ledger transactions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
