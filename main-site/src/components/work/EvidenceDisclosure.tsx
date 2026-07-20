"use client";

import { useState } from "react";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import EvidenceCard from "@/components/work/EvidenceCard";

export default function EvidenceDisclosure({ evidence }: { evidence: PublicEvidenceProjection[] }) {
  const [open, setOpen] = useState(false);
  if (!evidence.length || evidence.every((item) => item.placeholder)) return null;

  return (
    <div className="evidence-disclosure">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Hide supporting material" : `View supporting material (${evidence.filter((item) => !item.placeholder).length})`}
      </button>
      {open && (
        <div className="evidence-grid">
          {evidence.filter((item) => !item.placeholder).map((item) => (
            <EvidenceCard evidence={item} key={item.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
