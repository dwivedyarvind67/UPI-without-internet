import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  className = ""
}: SectionHeadingProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <h2 className="font-serif text-2xl md:text-3xl text-[var(--text-primary)] font-normal tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-[var(--text-secondary)] font-sans max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
