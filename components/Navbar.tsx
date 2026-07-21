"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load and apply theme client-side
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Simulator", href: "/demo" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Architecture", href: "/architecture" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "About", href: "/about" }
  ];

  return (
    <nav className="hairline-border-b bg-[var(--surface)] relative z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link
          href="/"
          className="font-serif font-semibold text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
        >
          OfflinePay <span className="font-mono text-xs font-normal text-[var(--text-secondary)]">Mesh</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-mono tracking-wide uppercase transition-colors hover:text-[var(--accent)] ${
                  isActive
                    ? "text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile toggles */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {mobileMenuOpen && (
        <div className="md:hidden hairline-border-b bg-[var(--surface)] absolute top-full left-0 w-full flex flex-col px-6 py-4 gap-4 shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs font-mono tracking-wide uppercase ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
