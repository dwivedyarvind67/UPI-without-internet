import React from "react";

interface StatStripProps {
  stats: string[];
  className?: string;
}

export function StatStrip({ stats, className = "" }: StatStripProps) {
  return (
    <div
      className={`hairline-border-t hairline-border-b py-3 bg-[rgba(20,33,61,0.01)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 md:gap-x-12 text-[10px] md:text-xs font-mono tracking-wider text-[var(--text-secondary)] uppercase">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <span>{stat}</span>
            {index < stats.length - 1 && (
              <span className="text-[var(--text-muted)] select-none">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
