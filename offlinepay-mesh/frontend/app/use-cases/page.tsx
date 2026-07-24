import React from "react";
import { Trees, AlertTriangle, Building, Landmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function UseCasesPage() {
  const cases = [
    {
      icon: <Trees className="w-5 h-5 text-[var(--accent)]" />,
      title: "Rural Commerce & Farming Markets",
      scenario: "Agriculture trade zones and weekly markets in remote villages often lack cellular data reception. Buyers can broadcast transaction packets locally using peer devices, allowing a delivery driver returning to town to route and settle all trades."
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />,
      title: "Disaster Relief & Power Grid Failures",
      scenario: "During grid failures or natural disasters, base station antennas can lose power or collapse. Relays can establish transaction networks locally to trade essential supplies, with local bridges logging transactions once satellite gateways come online."
    },
    {
      icon: <Building className="w-5 h-5 text-[var(--accent)]" />,
      title: "Sub-level Malls & Parking Terminals",
      scenario: "Basement parking decks, deep subways, and concrete structure shopping malls frequently present cellular dead zones. Customers issue payment packets locally, which route to terminals placed near building entries where internet signal is present."
    },
    {
      icon: <Landmark className="w-5 h-5 text-[var(--accent)]" />,
      title: "Transit Networks & Subways",
      scenario: "Commuters traveling through underground rail channels can make payments for tickets or convenience store purchases. Relays carry transaction payloads to transit exits, avoiding system blockages from network deadzones."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
      <SectionHeading
        title="Application Scenarios"
        subtitle="Exploring practical scenarios where mesh-routed transaction networks provide reliable operations despite zero cellular signal connectivity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cases.map((c) => (
          <Card key={c.title} className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-[4px] hairline-border flex items-center justify-center bg-[rgba(20,33,61,0.02)]">
                {c.icon}
              </div>
              <h3 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                {c.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                {c.scenario}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
