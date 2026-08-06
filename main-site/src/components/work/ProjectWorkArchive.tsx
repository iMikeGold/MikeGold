"use client";

import { useEffect, useMemo, useState } from "react";
import EvidenceDisclosure from "@/components/work/EvidenceDisclosure";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";
import {
  resolveCapabilityGroupId,
  type CapabilityGroupId,
} from "@/system/work/capability-groups";
import type { PublicWorkProjection } from "@/system/work/work.types";

type HatLabel = {
  slug: string;
  name: string;
};

const visibleHatLimit = 5;

export default function ProjectWorkArchive({
  work,
  hats,
  evidence,
}: {
  work: PublicWorkProjection[];
  hats: HatLabel[];
  evidence: PublicEvidenceProjection[];
}) {
  const [area, setArea] = useState<CapabilityGroupId | "">("");
  const [expandedHatSets, setExpandedHatSets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const requested = resolveCapabilityGroupId(
      new URLSearchParams(window.location.search).get("area"),
    );
    if (requested) setArea(requested);
  }, []);

  const hatBySlug = useMemo(
    () => new Map(hats.map((hat) => [hat.slug, hat])),
    [hats],
  );
  const evidenceBySlug = useMemo(
    () => new Map(evidence.map((item) => [item.slug, item])),
    [evidence],
  );
  const orderedWork = useMemo(
    () =>
      work
        .map((item, index) => ({ item, index }))
        .sort((left, right) => {
          const leftContext = area && left.item.capabilityGroupIds.includes(area) ? 0 : 1;
          const rightContext = area && right.item.capabilityGroupIds.includes(area) ? 0 : 1;
          return (
            leftContext - rightContext ||
            (left.item.sequence ?? 999) - (right.item.sequence ?? 999) ||
            left.index - right.index
          );
        })
        .map(({ item }) => item),
    [area, work],
  );

  return (
    <>
      <style>{`
        .applied-hat-toggle {
          display: inline-flex;
          align-items: center;
          gap: .28rem;
          width: max-content;
          margin: .45rem 0 0;
          border: 0;
          padding: 0;
          color: #9fc0ff;
          background: transparent;
          cursor: pointer;
          font-size: .7rem;
        }

        .applied-hat-toggle span {
          font-size: .78rem;
          line-height: 1;
        }
      `}</style>
      <div className="project-work-sections">
        {orderedWork.map((item) => {
          const isContextual = !area || item.capabilityGroupIds.includes(area);
          const itemEvidence = item.evidenceSlugs.flatMap((slug) => {
            const record = evidenceBySlug.get(slug);
            return record ? [record] : [];
          });
          const additionalHatCount = Math.max(0, item.appliedHatSlugs.length - visibleHatLimit);
          const isHatSetExpanded = expandedHatSets[item.slug] ?? false;
          const displayedHats = isHatSetExpanded
            ? item.appliedHatSlugs
            : item.appliedHatSlugs.slice(0, visibleHatLimit);

          return (
            <article
              key={item.slug}
              className={`project-work-section${isContextual ? " is-contextual" : ""}`}
            >
              <div className="record-status-row">
                <span>{item.status.replaceAll("-", " ")}</span>
                <span>Work contribution</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              {!!displayedHats.length && (
                <div className="applied-hat-list" aria-label="Applied Hats">
                  {displayedHats.map((slug) => (
                    <span key={slug}>{hatBySlug.get(slug)?.name ?? slug}</span>
                  ))}
                </div>
              )}
              {!!additionalHatCount && (
                <button
                  type="button"
                  className="applied-hat-toggle"
                  aria-expanded={isHatSetExpanded}
                  onClick={() =>
                    setExpandedHatSets((previous) => ({
                      ...previous,
                      [item.slug]: !isHatSetExpanded,
                    }))
                  }
                >
                  <span aria-hidden="true">{isHatSetExpanded ? "▴" : "▾"}</span>
                  {isHatSetExpanded ? "Show fewer Hats" : `+${additionalHatCount} more`}
                </button>
              )}
              {!!item.stages?.length && (
                <ol className="work-stage-list">
                  {item.stages.map((stage) => (
                    <li key={stage.key}>
                      <strong>{stage.label}</strong>
                      <span>{stage.status.replaceAll("-", " ")}</span>
                    </li>
                  ))}
                </ol>
              )}
              <EvidenceDisclosure evidence={itemEvidence} defaultOpen={false} />
            </article>
          );
        })}
      </div>
    </>
  );
}
