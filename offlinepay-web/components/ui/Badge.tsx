import React from "react";

interface BadgeProps {
  status?: "active" | "idle" | "error";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ status = "idle", children, className = "" }: BadgeProps) {
  const dots = {
    active: "bg-[var(--accent)]",
    idle: "bg-[var(--text-muted)]",
    error: "bg-red-600"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-[var(--text-secondary)] uppercase ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {children}
    </span>
  );
}
