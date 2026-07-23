"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicHat } from "@/system/hats/hat.types";
import type { PublicProjectProjection } from "@/system/projects/project.types";
import { CAPABILITY_GROUPS, resolveCapabilityGroupId, type CapabilityGroupId } from "@/system/work/capability-groups";
import type { PublicWorkCardProjection, PublicWorkProjection } from "@/system/work/work.types";

type View = "projects" | "work" | "capabilities";
type ProjectSort = "relevance" | "name" | "newest" | "oldest";
const DIRECTORY_PAGE_SIZE = 7;
const SHOWCASE_LIMIT = 6;

export default function WorkExplorer({
  projects,
  work,
  hats,
  cards,
}: {
  projects: PublicProjectProjection[];
  work: PublicWorkProjection[];
  hats: PublicHat[];
  cards: PublicWorkCardProjection[];
}) {
  const [view, setView] = useState<View>("projects");
  const [query, setQuery] = useState("");
  const [hatFilter, setHatFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState<CapabilityGroupId | "">("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [projectSort, setProjectSort] = useState<ProjectSort>("relevance");
  const [directoryLimit, setDirectoryLimit] = useState(DIRECTORY_PAGE_SIZE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedArea = resolveCapabilityGroupId(params.get("area"));
    if (requestedArea) {
      setGroupFilter(requestedArea);
      setArchiveOpen(true);
      setView("projects");
    }
    const requestedQuery = params.get("q");
    if (requestedQuery) { setQuery(requestedQuery); setArchiveOpen(true); }
    const requestedHat = params.get("hat");
    if (requestedHat) { setHatFilter(requestedHat); setArchiveOpen(true); }
    const requestedSort = params.get("sort");
    if (requestedSort === "name" || requestedSort === "newest" || requestedSort === "oldest") setProjectSort(requestedSort);
    const requestedLimit = Number(params.get("limit"));
    if (Number.isFinite(requestedLimit) && requestedLimit > DIRECTORY_PAGE_SIZE) setDirectoryLimit(Math.ceil(requestedLimit / DIRECTORY_PAGE_SIZE) * DIRECTORY_PAGE_SIZE);
  }, []);

  useEffect(() => {
    if (!archiveOpen) return;
    const params = new URLSearchParams();
    if (groupFilter) params.set("area", groupFilter);
    if (query.trim()) params.set("q", query.trim());
    if (hatFilter) params.set("hat", hatFilter);
    if (projectSort !== "relevance") params.set("sort", projectSort);
    if (directoryLimit > DIRECTORY_PAGE_SIZE) params.set("limit", String(directoryLimit));
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [archiveOpen, directoryLimit, groupFilter, hatFilter, projectSort, query]);

  const projectHref = (slug: string) => groupFilter
    ? `/projects/${slug}?area=${groupFilter}`
    : `/projects/${slug}`;

  const hatBySlug = useMemo(
    () => new Map(hats.map((hat) => [hat.slug, hat])),
    [hats],
  );
  const usedHatSlugs = useMemo(
    () => [...new Set(work
      .filter((item) => !groupFilter || item.capabilityGroupIds.includes(groupFilter))
      .flatMap((item) => item.appliedHatSlugs))].sort(),
    [groupFilter, work],
  );
  const normalizedQuery = query.trim().toLowerCase();
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
  const visibleCards = visibleProjects.flatMap((project) => {
    const card = cards.find((item) => item.projectSlug === project.slug && item.lensId === (groupFilter || undefined));
    return card ? [card] : [];
  });
  const searchRelevance = (projectSlug: string) => {
    if (!normalizedQuery) return 0;
    const project = projects.find((item) => item.slug === projectSlug);
    const exactProjectMatch = project?.name.toLowerCase().includes(normalizedQuery) ? 30 : 0;
    const contributionMatches = visibleWork.filter((item) => item.projectSlug === projectSlug && `${item.title} ${item.summary}`.toLowerCase().includes(normalizedQuery)).length;
    return exactProjectMatch + Math.min(20, contributionMatches * 8);
  };
  const orderedProjects = [...visibleProjects].sort((left, right) => {
    if (projectSort === "name") return left.name.localeCompare(right.name);
    if (projectSort === "newest") return (right.establishedYear ?? 0) - (left.establishedYear ?? 0) || left.name.localeCompare(right.name);
    if (projectSort === "oldest") return (left.establishedYear ?? 9999) - (right.establishedYear ?? 9999) || left.name.localeCompare(right.name);
    const leftCard = visibleCards.find((card) => card.projectSlug === left.slug);
    const rightCard = visibleCards.find((card) => card.projectSlug === right.slug);
    const leftScore = leftCard?.finalScore ?? 0;
    const rightScore = rightCard?.finalScore ?? 0;
    return (rightScore + searchRelevance(right.slug)) - (leftScore + searchRelevance(left.slug)) || (rightCard?.evidenceCompletenessScore ?? 0) - (leftCard?.evidenceCompletenessScore ?? 0) || (leftCard?.editorialSequence ?? 9999) - (rightCard?.editorialSequence ?? 9999) || left.name.localeCompare(right.name) || left.slug.localeCompare(right.slug);
  });
  const orderedCards = orderedProjects.flatMap((project) => {
    const card = visibleCards.find((item) => item.projectSlug === project.slug);
    return card ? [card] : [];
  });
  const showcaseCards = orderedCards.slice(0, SHOWCASE_LIMIT);
  const showcaseProjectSlugs = new Set(showcaseCards.map((card) => card.projectSlug));
  const remainingProjects = orderedProjects.filter((project) => !showcaseProjectSlugs.has(project.slug));
  const directoryProjects = remainingProjects.slice(0, directoryLimit);
  const selectedGroup = CAPABILITY_GROUPS.find((group) => group.id === groupFilter);

  return (
    <section className="work-explorer" aria-labelledby="work-explorer-title">
      <header className="page-header work-page-header">
        <p className="work-kicker">SYSTEMS DELIVERED</p>
        <h1>WORK</h1>
        <p>
          {selectedGroup?.summary ??
            "A growing record of products, identities, applications, infrastructure and engineering environments I have designed, built, deployed or helped bring into operation."}
        </p>
      </header>
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
                setHatFilter("");
                setQuery("");
                setDirectoryLimit(DIRECTORY_PAGE_SIZE);
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
                  {projectCount} project{projectCount === 1 ? "" : "s"} · {connectedWork.length} contributions
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
        <strong>{selectedGroup?.name ?? `${projects.length} project records`}</strong>
        <button type="button" onClick={() => { setGroupFilter(""); setHatFilter(""); setQuery(""); setDirectoryLimit(DIRECTORY_PAGE_SIZE); setArchiveOpen(false); }}>
          ← Return to six areas
        </button>
      </div>
      <div className="work-explorer-heading" id="work-results">
        <div>
          <p className="work-kicker">STRUCTURED WORK ARCHIVE</p>
          <h2>{selectedGroup?.name ?? "Selected systems and applied work"}</h2>
        </div>
        <div className="work-view-tabs" aria-label="Work views">
          {(["projects", "work", "capabilities"] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={view === option ? "is-active" : ""}
              onClick={() => setView(option)}
            >
              {{ projects: "Selected Work", work: "Contributions", capabilities: "Capabilities" }[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="work-filters">
        <label>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setDirectoryLimit(DIRECTORY_PAGE_SIZE); }}
            placeholder="Project, work or contribution"
          />
        </label>
        <label>
          <span>Capability</span>
          <select value={hatFilter} onChange={(event) => { setHatFilter(event.target.value); setDirectoryLimit(DIRECTORY_PAGE_SIZE); }}>
            <option value="">All applied Hats</option>
            {usedHatSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {hatBySlug.get(slug)?.name ?? slug}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort projects</span>
          <select value={projectSort} onChange={(event) => { setProjectSort(event.target.value as ProjectSort); setDirectoryLimit(DIRECTORY_PAGE_SIZE); }}>
            <option value="relevance">Editorial relevance</option>
            <option value="name">Project name</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      {archiveOpen && (
        <button
          type="button"
          className="clear-work-route"
          onClick={() => {
            setGroupFilter(""); setHatFilter(""); setQuery(""); setDirectoryLimit(DIRECTORY_PAGE_SIZE); setArchiveOpen(false);
          }}
        >
          Back to the six areas
        </button>
      )}

      {view === "projects" && (
        <>
        <header className="work-section-heading">
          <div><p className="work-kicker">SELECTED WORK</p><h3>Representative projects</h3></div>
          <span>{showcaseCards.length} of {visibleProjects.length} matching projects</span>
        </header>
        <div className="project-record-grid">
          {showcaseCards.map((card) => {
            const project = projects.find((item) => item.slug === card.projectSlug)!;
            const relevantVisuals = [card.primaryVisual].filter(
              (item): item is NonNullable<typeof item> => Boolean(item),
            );
            const capabilityCount = card.leadHatSlugs.length + card.supportingHatSlugs.length;
            return (
              <article className="project-record-card" key={project.slug}>
                {!!relevantVisuals.length && (
                  <div className="project-evidence-preview project-evidence-preview-1">
                    {relevantVisuals.map((item) => (
                      <figure key={item.evidenceSlug}>
                        <img src={item.src} alt={item.alt} loading="lazy" />
                      </figure>
                    ))}
                  </div>
                )}
                <div className="record-status-row">
                  <span>{project.status.replaceAll("-", " ")}</span>
                  <span>{project.context ?? project.establishedYear ?? "Period being documented"}</span>
                </div>
                <span className="work-project-label">PROJECT</span>
                <h3>{card.projectName}</h3>
                <span className="work-project-label">CONTRIBUTION</span>
                <h4>{card.contributionTitle}</h4>
                <p>{card.summary}</p>
                <div className="record-measures">
                  <span>
                    {card.relevantWorkSlugs.length} contribution{card.relevantWorkSlugs.length === 1 ? "" : "s"}
                  </span>
                  <span>{capabilityCount} applied Hats</span>
                </div>
                <Link href={card.href}>View work →</Link>
              </article>
            );
          })}
        </div>
        <section className="complete-work-index" aria-labelledby="complete-work-index-title">
          <header className="work-section-heading">
            <div><p className="work-kicker">ALL MATCHING WORK</p><h3 id="complete-work-index-title">Complete project index</h3></div>
            <span>{visibleProjects.length} project{visibleProjects.length === 1 ? "" : "s"} · {visibleWork.length} contribution{visibleWork.length === 1 ? "" : "s"}</span>
          </header>
          <div className="compact-project-directory">
            {directoryProjects.map((project) => {
              const projectWork = visibleWork.filter((item) => item.projectSlug === project.slug);
              const capabilityCount = new Set(projectWork.flatMap((item) => item.appliedHatSlugs)).size;
              return <Link className="compact-project-row" href={projectHref(project.slug)} key={project.slug}>
                <span><strong>{project.name}</strong><small>{project.summary}</small></span>
                <span>{projectWork.length} contribution{projectWork.length === 1 ? "" : "s"} · {capabilityCount} capabilities</span>
                <span>View →</span>
              </Link>;
            })}
          </div>
          {directoryProjects.length < remainingProjects.length && (
            <button className="load-more-work" type="button" onClick={() => setDirectoryLimit((value) => value + DIRECTORY_PAGE_SIZE)}>
              Show {Math.min(DIRECTORY_PAGE_SIZE, remainingProjects.length - directoryProjects.length)} more
            </button>
          )}
        </section>
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
        <div><p className="work-kicker">CAPABILITIES EVIDENCED IN THIS VIEW</p><div className="capability-work-grid">
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
        </div></div>
      )}

      {!visibleWork.length && (
        <p className="work-empty-state">No documented work matches these filters yet.</p>
      )}
      </div>}
    </section>
  );
}
