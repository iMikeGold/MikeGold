"use client";

import { useEffect, useMemo, useState } from "react";
import EvidenceDisclosure from "@/components/work/EvidenceDisclosure";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import type { PublicHat } from "@/system/hats/hat.types";
import { CAPABILITY_GROUPS, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkProjection } from "@/system/work/work.types";

const EVIDENCE_ROLE_ORDER: Record<CapabilityGroupId, string[]> = {
  "physical-technical-engineering": ["application", "process", "reference", "interface", "cover", "identity"],
  "system-product-definition": ["process", "application", "interface", "cover", "identity", "reference"],
  "software-web-engineering": ["cover", "interface", "application", "identity", "process", "reference"],
  "infrastructure-operations": ["interface", "cover", "reference", "process", "application", "identity"],
  "brand-experience-systems": ["identity", "process", "application", "cover", "interface", "reference"],
  "media-asset-systems": ["application", "process", "reference", "identity", "interface", "cover"],
};

const FOCUS_EVIDENCE_ROLES: Record<CapabilityGroupId, string[]> = {
  "physical-technical-engineering": ["application", "process", "reference"],
  "system-product-definition": ["process", "application", "interface", "cover", "identity"],
  "software-web-engineering": ["cover", "interface"],
  "infrastructure-operations": ["interface", "cover", "reference"],
  "brand-experience-systems": ["identity", "process", "application"],
  "media-asset-systems": ["application", "process", "reference", "identity"],
};

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
  const deferredEvidence = area
    ? [...new Map(
        work
          .flatMap((item) => item.evidenceSlugs)
          .flatMap((slug) => {
            const record = evidenceBySlug.get(slug);
            return record && !FOCUS_EVIDENCE_ROLES[area].includes(record.role ?? "reference") ? [[record.slug, record] as const] : [];
          }),
      ).values()]
    : [];

  return (
    <div className="project-work-sections">
      {orderedWork.map((item) => {
        const isContextual = !area || item.capabilityGroupIds.includes(area);
        const itemEvidence = item.evidenceSlugs.flatMap((slug) => {
          const record = evidenceBySlug.get(slug);
          if (!record) return [];
          if (area && !FOCUS_EVIDENCE_ROLES[area].includes(record.role ?? "reference")) return [];
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
              roleOrder={area ? EVIDENCE_ROLE_ORDER[area] : undefined}
              defaultOpen={area ? isContextual : itemEvidence.some((record) => Boolean(record.assetPath && record.role !== "cover"))}
            />
          </article>
        );
      })}
      {!!deferredEvidence.length && (
        <article className="project-work-section project-deferred-evidence">
          <div className="record-status-row"><span>PROJECT CONTEXT</span><span>Other disciplines</span></div>
          <h3>Other project material</h3>
          <p>Supporting work from outside the selected area remains available without interrupting this focused route.</p>
          <EvidenceDisclosure evidence={deferredEvidence} defaultOpen={false} />
        </article>
      )}
    </div>
  );
}
