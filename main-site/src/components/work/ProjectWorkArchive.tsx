"use client";

import { useEffect, useMemo, useState } from "react";
import EvidenceDisclosure from "@/components/work/EvidenceDisclosure";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import type { PublicHat } from "@/system/hats/hat.types";
import { CAPABILITY_GROUPS, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkProjection } from "@/system/work/work.types";

export default function ProjectWorkArchive({ work, hats, evidence }: {
  work: PublicWorkProjection[];
  hats: PublicHat[];
  evidence: PublicEvidenceProjection[];
}) {
  const [area, setArea] = useState<CapabilityGroupId | "">("");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("area");
    if (CAPABILITY_GROUPS.some((group) => group.id === requested)) setArea(requested as CapabilityGroupId);
  }, []);

  const hatBySlug = useMemo(() => new Map(hats.map((hat) => [hat.slug, hat])), [hats]);
  const evidenceBySlug = useMemo(() => new Map(evidence.map((item) => [item.slug, item])), [evidence]);
  const orderedWork = work
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftContext = area && left.item.capabilityGroupIds.includes(area) ? 0 : 1;
      const rightContext = area && right.item.capabilityGroupIds.includes(area) ? 0 : 1;
      return leftContext - rightContext || (left.item.sequence ?? 999) - (right.item.sequence ?? 999) || left.index - right.index;
    })
    .map(({ item }) => item);
  return (
    <div className="project-work-sections">
      {orderedWork.map((item) => {
        const isContextual = !area || item.capabilityGroupIds.includes(area);
        const itemEvidence = item.evidenceSlugs.flatMap((slug) => {
          const record = evidenceBySlug.get(slug);
          if (!record) return [];
          return [record];
        });
        return (
          <article key={item.slug} className={`project-work-section${isContextual ? " is-contextual" : ""}`}>
            <div className="record-status-row">
              <span>{item.status.replaceAll("-", " ")}</span>
              <span>Work contribution</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            {!!item.appliedHatSlugs.length && (
              <div className="applied-hat-list" aria-label="Applied Hats">
                {item.appliedHatSlugs.map((slug) => <span key={slug}>{hatBySlug.get(slug)?.name ?? slug}</span>)}
              </div>
            )}
            {!!item.stages?.length && (
              <ol className="work-stage-list">
                {item.stages.map((stage) => <li key={stage.key}><strong>{stage.label}</strong><span>{stage.status.replaceAll("-", " ")}</span></li>)}
              </ol>
            )}
            <EvidenceDisclosure
              evidence={itemEvidence}
              defaultOpen={area ? isContextual : itemEvidence.some((record) => Boolean(record.assetPath && record.role !== "cover"))}
            />
          </article>
        );
      })}
    </div>
  );
}
