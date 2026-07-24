import { User, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-1">
      <SectionHeading
        title="Project & Developer Overview"
        subtitle="Behind the design choices, architectural philosophy, and implementation motivations of the OfflinePay Mesh project."
      />

      <div className="space-y-8">
        <Card className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-[4px] hairline-border flex items-center justify-center bg-[rgba(15,107,92,0.05)] text-[var(--accent)] flex-shrink-0">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              Arvind Dwivedi
            </h3>
            <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              Backend Systems & Cryptographic Protocol Developer
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans pt-2">
              Focusing on secure transactions, distributed architecture, and network resilience.
              This project is designed to prove that digital payments can remain functional and secure even in network-isolated environments, using sound cryptographic designs.
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-serif text-base text-[var(--text-primary)] mb-4">
            Why OfflinePay Mesh Was Developed
          </h3>
          <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
            <p>
              Traditional online UPI networks face severe vulnerabilities in deep concrete basements, subway structures, and remote rural markets. The objective of OfflinePay Mesh was to implement and test a secure, deferred-settlement transaction system.
            </p>
            <p>
              Through this project, key technical patterns were validated:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Hybrid Encryption Integration:</strong> Authenticating transactions through unverified intermediaries using AES-GCM tag verification.
              </li>
              <li>
                <strong>Deduplication Architecture:</strong> Short-circuiting parallel upload storms at the gateway using atomic registries to avoid balance corruption.
              </li>
              <li>
                <strong>Replay Mitigation:</strong> Replay prevention using encrypted signature nonces and freshness limits.
              </li>
            </ul>
          </div>
        </Card>

        {/* Contact links */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <a
            href="https://github.com/dwivedyarvind67"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Profile
            </Button>
          </a>
          <a href="mailto:dwivedyarvind67@gmail.com">
            <Button variant="secondary" className="gap-2">
              <Mail className="w-4 h-4" /> Email Arvind
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
