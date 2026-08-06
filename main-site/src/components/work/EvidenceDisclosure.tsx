"use client";

import { useEffect, useState } from "react";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import EvidenceCard from "@/components/work/EvidenceCard";

type IdentityGroup = {
  title: string;
  items: PublicEvidenceProjection[];
  compact: boolean;
};

function groupIdentityEvidence(items: PublicEvidenceProjection[]): IdentityGroup[] {
  const groups = new Map<string, PublicEvidenceProjection[]>();
  for (const item of items) {
    const title = item.title.toLowerCase();
    const group = title.startsWith("school emblem")
      ? "School emblem treatments"
      : title.startsWith("institution emblem")
        ? "Institution emblem treatments"
        : title.includes("lowercase b") || title.includes("uppercase b")
          ? "Master emblem construction"
          : "Identity system records";
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  const order = [
    "Identity system records",
    "Master emblem construction",
    "School emblem treatments",
    "Institution emblem treatments",
  ];
  return order.flatMap((title) => {
    const groupedItems = groups.get(title);
    return groupedItems?.length
      ? [{ title, items: groupedItems, compact: title !== "Identity system records" }]
      : [];
  });
}

export default function EvidenceDisclosure({
  evidence,
  defaultOpen = false,
  roleOrder = ["cover", "interface", "identity", "process", "application", "reference"],
}: {
  evidence: PublicEvidenceProjection[];
  defaultOpen?: boolean;
  roleOrder?: string[];
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  const available = evidence.filter(
    (item) =>
      !item.placeholder &&
      !(item.presentation?.displayRoles.length === 1 && item.presentation.displayRoles[0] === "archive"),
  );
  if (!available.length) return null;

  const roleCopy: Record<string, { title: string; description: string }> = {
    cover: { title: "Website and digital experience", description: "The public-facing interface and visual system in context." },
    interface: { title: "Interface development", description: "Selected screens and interaction studies from the digital experience." },
    identity: { title: "Identity development", description: "Marks, directions and production variations developed as part of the identity system." },
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
      <style>{`
        .evidence-subgroups { display: grid; gap: 1rem; margin-top: 1rem; }
        .evidence-subgroup { display: grid; gap: .65rem; }
        .evidence-subgroup > h5 { margin: 0; color: #aaa; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
        .evidence-grid.is-compact { grid-template-columns: repeat(auto-fit, minmax(min(100%, 135px), 1fr)); gap: .65rem; }
        .evidence-card.is-compact { min-width: 0; }
        .evidence-card.is-compact .evidence-image img { aspect-ratio: 1 / 1; max-height: 150px; object-fit: contain; }
        .evidence-card.is-compact > span { font-size: .58rem; }
        .evidence-card.is-compact > strong { font-size: .76rem; line-height: 1.3; }
      `}</style>
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
              {group.role === "identity" && group.items.length > 4 ? (
                <div className="evidence-subgroups">
                  {groupIdentityEvidence(group.items).map((subgroup) => (
                    <section className="evidence-subgroup" key={subgroup.title}>
                      <h5>{subgroup.title}</h5>
                      <div className={`evidence-grid${subgroup.compact ? " is-compact" : ""}`}>
                        {subgroup.items.map((item) => (
                          <EvidenceCard evidence={item} compact={subgroup.compact} key={item.slug} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="evidence-grid">
                  {group.items.map((item) => <EvidenceCard evidence={item} key={item.slug} />)}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
