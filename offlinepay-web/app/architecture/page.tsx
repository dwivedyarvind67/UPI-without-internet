import { Server, Database, ShieldAlert, Cpu, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function ArchitecturePage() {
  const stackItems = [
    { component: "Main Framework", technology: "Spring Boot 3.3.5 / Java 17" },
    { component: "Database Layer", technology: "Spring Data JPA / H2 In-Memory" },
    { component: "Deduplication Engine", technology: "ConcurrentHashMap (JVM-local SETNX)" },
    { component: "Cryptographic Core", technology: "JCA (Java Cryptography Architecture)" },
    { component: "Cipher Algorithms", technology: "RSA-2048-OAEP & AES-256-GCM" },
    { component: "Front-End Interface", technology: "Thymeleaf (Server-rendered) / Next.js" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
      <SectionHeading
        title="System Architecture & Implementation"
        subtitle="Exploring the core backend pipeline, in-memory databases, cryptographic algorithms, and distributed ledger configurations."
      />

      {/* Tech Stack List */}
      <Card className="mb-10">
        <h3 className="font-serif text-base text-[var(--text-primary)] mb-4">
          Software Stack Components
        </h3>
        <div className="divide-y divide-[var(--border)]">
          {stackItems.map((item) => (
            <div key={item.component} className="py-3 flex justify-between items-center text-xs font-mono">
              <span className="text-[var(--text-secondary)]">{item.component}</span>
              <span className="text-[var(--text-primary)] font-medium">{item.technology}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Diagram Walkthrough Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
            <h4 className="font-serif text-base text-[var(--text-primary)]">
              Cryptography Suite
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans mb-3">
            The hybrid system uses <strong>RSA-OAEP</strong> to encrypt a unique one-time <strong>AES-256 key</strong> for each payment packet. The transaction metadata is encrypted using the session key via <strong>AES-GCM</strong>, which provides authentication properties ensuring that any packet data modifications will make decryption fail.
          </p>
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Standards: FIPS-compliant JCA Algorithms
          </span>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <h4 className="font-serif text-base text-[var(--text-primary)]">
              Deduplication Layer
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans mb-3">
            In production, our <code className="font-mono text-[var(--text-primary)]">DeduplicationService</code> transitions directly to a <strong>Redis cache cluster</strong> executing <code className="font-mono text-[var(--text-primary)]">SET packet_hash timestamp NX EX 86400</code> queries. Ledgers also maintain unique DB constraints on the <code className="font-mono text-[var(--text-primary)]">packetHash</code> field to prevent duplicate settlement.
          </p>
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Defense: Multi-layer Optimistic Locking
          </span>
        </Card>
      </div>

      {/* GitHub Repository Reference Card */}
      <Card className="bg-[rgba(15,107,92,0.03)] border-[rgba(15,107,92,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h4 className="font-serif text-base text-[var(--text-primary)] font-semibold mb-1">
            Access Source Repository
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Review the complete java backend implementation, automated pipeline integration test scenarios, and simulated BLE routing logic on GitHub.
          </p>
        </div>
        <a
          href="https://github.com/dwivedyarvind67/UPI-without-internet.git"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button variant="primary" className="gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      </Card>
    </div>
  );
}
