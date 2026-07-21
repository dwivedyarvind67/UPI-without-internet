import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "secondary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center px-4 py-2 text-xs font-mono font-medium rounded-[4px] tracking-wide transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-[var(--accent)] text-[var(--bg)] border border-[var(--accent)] hover:opacity-90 active:scale-[0.98]",
    secondary:
      "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[rgba(20,33,61,0.04)] active:scale-[0.98]",
    danger:
      "bg-red-800 text-white border border-red-900 hover:bg-red-950 active:scale-[0.98]"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
