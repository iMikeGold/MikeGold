"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicProjectProjection } from "@/system/projects/project.types";
import { CAPABILITY_GROUPS, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkProjection } from "@/system/work/work.types";
import type { PublicEvidenceProjection } from "@/system/evidence/evidence.types";

type View = "projects" | "work" | "capabilities";

const AREA_EVIDENCE_ROLES: Record<CapabilityGroupId, string[]> = {
  "physical-technical-engineering": ["application", "reference", "process"],
  "system-product-definition": ["process", "application", "interface", "identity"],
  "software-web-engineering": ["interface", "cover"],
  "infrastructure-operations": ["interface", "cover", "reference"],
  "brand-experience-systems": ["identity", "process", "application"],
  "media-asset-systems": ["application", "process", "reference", "identity"],
};

export default function WorkExplorer({
  projects,
  work,
  hats,
  evidence,
}: {
  projects: PublicProjectProjection[];
  work: PublicWorkProjection[];
  hats: PublicHat[];
  evidence: PublicEvidenceProjection[];
}) {
  const [view, setView] = useState<View>("projects");
  const [query, setQuery] = useState("");
  const [hatFilter, setHatFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState<CapabilityGroupId | "">("");
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    const requestedArea = new URLSearchParams(window.location.search).get("area");
    if (CAPABILITY_GROUPS.some((group) => group.id === requestedArea)) {
      setGroupFilter(requestedArea as CapabilityGroupId);
      setArchiveOpen(true);
      setView("projects");
    }
  }, []);

  const projectHref = (slug: string) => groupFilter
    ? `/projects/${slug}?area=${groupFilter}`
    : `/projects/${slug}`;

  const hatBySlug = useMemo(
    () => new Map(hats.map((hat) => [hat.slug, hat])),
    [hats],
  );
  const usedHatSlugs = useMemo(
    () => [...new Set(work.flatMap((item) => item.appliedHatSlugs))].sort(),
    [work],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const evidenceBySlug = useMemo(
    () => new Map(evidence.map((item) => [item.slug, item])),
    [evidence],
  );
  const visibleWork = work.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      `${item.title} ${item.summary} ${item.projectSlug}`
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesGroup =
      !groupFilter || item.capabilityGroupIds.includes(groupFilter);
    return matchesQuery && matchesGroup && (!hatFilter || item.appliedHatSlugs.includes(hatFilter));
  });
  const visibleProjectSlugs = new Set(visibleWork.map((item) => item.projectSlug));
  const visibleProjects = projects.filter((project) => {
    if (hatFilter || groupFilter) return visibleProjectSlugs.has(project.slug);
    if (!normalizedQuery) return archiveOpen;
    return (
      `${project.name} ${project.summary}`.toLowerCase().includes(normalizedQuery) ||
      visibleProjectSlugs.has(project.slug)
    );
  });

  return (
    <section className="work-explorer" aria-labelledby="work-explorer-title">
      {!archiveOpen && <>
      <div className="capability-group-intro">
        <p className="work-kicker">SIX CONNECTED AREAS</p>
        <h2 id="work-explorer-title">Start with the whole picture</h2>
        <p>
          Choose an area for a focused route through the archive. Projects can
          cross several areas because the work behind them often does too.
        </p>
      </div>

      <div className="capability-group-grid">
        {CAPABILITY_GROUPS.map((group) => {
          const connectedWork = work.filter((item) => item.capabilityGroupIds.includes(group.id));
          const projectCount = new Set(connectedWork.map((item) => item.projectSlug)).size;
          return (
            <button
              type="button"
              key={group.id}
              className={groupFilter === group.id ? "capability-group-card is-active" : "capability-group-card"}
              aria-pressed={groupFilter === group.id}
              onClick={() => {
                setGroupFilter(group.id);
                setArchiveOpen(true);
                setView("projects");
              }}
            >
              <span className="capability-group-face capability-group-front">
                <span className="capability-group-code">{group.code}</span>
                <strong>{group.name}</strong>
                <span className="capability-group-count">Open area →</span>
              </span>
              <span className="capability-group-face capability-group-back">
                <span className="capability-group-summary">{group.summary}</span>
                <span className="capability-group-count">
                  {projectCount} project{projectCount === 1 ? "" : "s"} · {connectedWork.length} work records
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {!archiveOpen && (
        <div className="work-entry-actions">
          <p>Select an area to see its connected projects and contributions.</p>
          <button type="button" className="show-all-projects" onClick={() => setArchiveOpen(true)}>
            Browse the complete archive
          </button>
        </div>
      )}
      </>}

      {archiveOpen && <div className="work-archive-panel">
      <div className="work-route-banner">
        <span>{groupFilter ? "AREA SELECTED" : "COMPLETE ARCHIVE"}</span>
        <strong>{groupFilter ? CAPABILITY_GROUPS.find((group) => group.id === groupFilter)?.name : `${projects.length} project records`}</strong>
        <button type="button" onClick={() => { setGroupFilter(""); setHatFilter(""); setQuery(""); setArchiveOpen(false); }}>
          ← Return to six areas
        </button>
      </div>
      <div className="work-explorer-heading" id="work-results">
        <div>
          <p className="work-kicker">STRUCTURED WORK ARCHIVE</p>
          <h2>{groupFilter ? CAPABILITY_GROUPS.find((group) => group.id === groupFilter)?.name : "Selected systems and applied work"}</h2>
        </div>
        <div className="work-view-tabs" aria-label="Work views">
          {(["projects", "work", "capabilities"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={view === option ? "is-active" : ""}
              onClick={() => setView(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="work-filters">
        <label>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Project, work or contribution"
          />
        </label>
        <label>
          <span>Capability</span>
          <select value={hatFilter} onChange={(event) => setHatFilter(event.target.value)}>
            <option value="">All applied Hats</option>
            {usedHatSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {hatBySlug.get(slug)?.name ?? slug}
              </option>
            ))}
          </select>
        </label>
      </div>

      {archiveOpen && (
        <button
          type="button"
          className="clear-work-route"
          onClick={() => {
            setGroupFilter(""); setHatFilter(""); setQuery(""); setArchiveOpen(false);
          }}
        >
          Back to the six areas
        </button>
      )}

      {view === "projects" && (
        <>
        <div className="project-record-grid">
          {visibleProjects.map((project) => {
            const projectWork = work.filter((item) => item.projectSlug === project.slug);
            const contextualWork = groupFilter
              ? projectWork.filter((item) => item.capabilityGroupIds.includes(groupFilter))
              : projectWork;
            const projectEvidenceWithDuplicates = contextualWork
              .flatMap((item) => item.evidenceSlugs)
              .flatMap((slug) => {
                const record = evidenceBySlug.get(slug);
                return record ? [record] : [];
              });
            const projectEvidence = [...new Map(projectEvidenceWithDuplicates.map((item) => [item.slug, item])).values()];
            const roleOrder = groupFilter ? AREA_EVIDENCE_ROLES[groupFilter] : ["cover", "identity", "process", "application", "interface", "reference"];
            const visualEvidence = projectEvidence
              .filter((item) => item.assetPath)
              .sort((left, right) => {
                const roleDifference = roleOrder.indexOf(left.role ?? "reference") - roleOrder.indexOf(right.role ?? "reference");
                return roleDifference || (left.sequence ?? 0) - (right.sequence ?? 0);
              });
            const relevantVisuals = groupFilter
              ? visualEvidence.filter((item) => roleOrder.includes(item.role ?? "reference")).slice(0, 3)
              : visualEvidence.slice(0, 1);
            const capabilityCount = new Set(
              projectWork.flatMap((item) => item.appliedHatSlugs),
            ).size;
            return (
              <article className="project-record-card" key={project.slug}>
                {!!relevantVisuals.length && (
                  <div className={`project-evidence-preview project-evidence-preview-${Math.min(relevantVisuals.length, 3)}`}>
                    {relevantVisuals.map((item) => (
                      <figure key={item.slug}>
                        <img src={item.assetPath} alt={item.title} loading="lazy" />
                        <figcaption>{item.title}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                <div className="record-status-row">
                  <span>{project.status.replaceAll("-", " ")}</span>
                  <span>{project.context ?? project.establishedYear ?? "Period being documented"}</span>
                </div>
                <h3>{project.name}</h3>
                <p>{groupFilter ? contextualWork[0]?.summary ?? project.summary : project.summary}</p>
                {groupFilter && contextualWork.length > 0 && (
                  <div className="project-context-work" aria-label="Relevant work">
                    {contextualWork.map((item) => <span key={item.slug}>{item.title}</span>)}
                  </div>
                )}
                <div className="record-measures">
                  <span>
                    {projectWork.length} work record{projectWork.length === 1 ? "" : "s"}
                  </span>
                  <span>{capabilityCount} applied Hats</span>
                </div>
                <Link href={projectHref(project.slug)}>Open project record →</Link>
              </article>
            );
          })}
        </div>
        </>
      )}

      {view === "work" && (
        <div className="work-record-list">
          {visibleWork.map((item) => (
            <article key={item.slug} className="work-record-card">
              <div>
                <span className="work-project-label">
                  {projects.find((project) => project.slug === item.projectSlug)?.name ??
                    item.projectSlug.replaceAll("-", " ")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
              <div className="applied-hat-list">
                {item.appliedHatSlugs.map((slug) => (
                  <button type="button" key={slug} onClick={() => setHatFilter(slug)}>
                    {hatBySlug.get(slug)?.name ?? slug}
                  </button>
                ))}
                <Link className="work-project-link" href={projectHref(item.projectSlug)}>
                  Open project →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {view === "capabilities" && (
        <div className="capability-work-grid">
          {usedHatSlugs.map((slug) => {
            const connected = visibleWork.filter((item) => item.appliedHatSlugs.includes(slug));
            if (!connected.length) return null;
            return (
              <button
                type="button"
                className="capability-work-card"
                key={slug}
                onClick={() => {
                  setHatFilter(slug);
                  setView("work");
                }}
              >
                <strong>{hatBySlug.get(slug)?.name ?? slug}</strong>
                <span>{connected.length} connected work record{connected.length === 1 ? "" : "s"}</span>
              </button>
            );
          })}
        </div>
      )}

      {!visibleWork.length && (
        <p className="work-empty-state">No documented work matches these filters yet.</p>
      )}
      </div>}
    </section>
  );
}
