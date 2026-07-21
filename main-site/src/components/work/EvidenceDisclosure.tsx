"use client";

import { useEffect, useState } from "react";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import EvidenceCard from "@/components/work/EvidenceCard";

export default function EvidenceDisclosure({ evidence, defaultOpen = false, roleOrder = ["cover", "interface", "identity", "process", "application", "reference"] }: { evidence: PublicEvidenceProjection[]; defaultOpen?: boolean; roleOrder?: string[] }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  const available = evidence.filter((item) => !item.placeholder);
  if (!available.length) return null;
  const roleCopy: Record<string, { title: string; description: string }> = {
    cover: { title: "Website and digital experience", description: "The public-facing interface and visual system in context." },
    interface: { title: "Interface development", description: "Selected screens and interaction studies from the digital experience." },
    identity: { title: "Identity development", description: "Marks, directions and variations developed as part of the identity system." },
    process: { title: "Design language and evolution", description: "Exploration showing how the visual rules, structure and final direction developed." },
    application: { title: "Applied identity", description: "Product, packaging and contextual mock-ups showing the system in use." },
    reference: { title: "Supporting visuals", description: "Additional material that helps document the work and its context." },
  };
  const grouped = roleOrder
    .map((role) => ({
      role,
      items: available
        .filter((item) => (item.role ?? "reference") === role)
        .sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0)),
    }))
    .filter((group) => group.items.length);

  return (
    <div className="evidence-disclosure">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Hide supporting material" : `View supporting material (${available.length})`}
      </button>
      {open && (
        <div className="evidence-groups">
          {grouped.map((group) => (
            <section className={`evidence-group evidence-group-${group.role}`} key={group.role}>
              <header>
                <h4>{roleCopy[group.role].title}</h4>
                <p>{roleCopy[group.role].description}</p>
              </header>
              <div className="evidence-grid">
                {group.items.map((item) => (
                  <EvidenceCard evidence={item} key={item.slug} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
