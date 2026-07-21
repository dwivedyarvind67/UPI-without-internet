import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hairline-border-t bg-[var(--surface)] mt-auto relative overflow-hidden">
      {/* Signature dotted route line motif across the top of footer */}
      <div className="absolute top-0 left-0 w-full h-[1px] dashed-route-line opacity-30" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="font-serif font-semibold text-base text-[var(--text-primary)]">
              OfflinePay Mesh
            </span>
            <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              An offline transaction propagation network utilizing Bluetooth Mesh routing.
              Demonstrating secure deferred settlement, cryptographic tamper-proofing,
              and distributed idempotency.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] uppercase mb-3">
              Sections
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link
                  href="/demo"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  Simulator
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/architecture"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  System Design
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] uppercase mb-3">
              Developer
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href="https://github.com/dwivedyarvind67"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  GitHub Project
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  About Arvind
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 hairline-border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            © {currentYear} Arvind Dwivedi. All rights reserved.
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Designed for institutional review & technical evaluation.
          </span>
        </div>
      </div>
    </footer>
  );
}
