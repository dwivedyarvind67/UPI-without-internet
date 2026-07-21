import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-[var(--surface)] hairline-border rounded-[4px] p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
